'use strict';

const SCHEMA_HELP_DOC = 'docs/ops/projects-v2-auth.md';
const SCHEMA_HELP_ANCHOR = 'fieldoption-mismatch-warnings';

function schemaHelp() {
  return `See ${SCHEMA_HELP_DOC}#${SCHEMA_HELP_ANCHOR}`;
}

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

function yyyyMmDd(dateLike) {
  if (!dateLike) return null;
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function mapProjectFields(fieldsNodes) {
  const fields = fieldsNodes || [];

  const byName = new Map();
  for (const f of fields) byName.set(normalize(f.name), f);

  const statusField = byName.get('status');
  const doneDateField = byName.get('done date') || byName.get('done_date') || byName.get('done');
  const needsDecisionField = byName.get('needs decision') || byName.get('needs_decision');

  let statusDoneOptionId = null;
  if (statusField?.dataType === 'SINGLE_SELECT') {
    const opt = (statusField.options || []).find((o) => normalize(o.name) === 'done');
    statusDoneOptionId = opt?.id || null;
  }

  return {
    statusField,
    statusDoneOptionId,
    doneDateField,
    needsDecisionField,
  };
}

async function getProjectMetadata({ graphql, orgLogin, projectNumber }) {
  const query = `
    query($org: String!, $number: Int!) {
      organization(login: $org) {
        projectV2(number: $number) {
          id
          title
          fields(first: 100) {
            nodes {
              __typename
              ... on ProjectV2FieldCommon {
                id
                name
                dataType
              }
              ... on ProjectV2SingleSelectField {
                id
                name
                dataType
                options {
                  id
                  name
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await graphql(query, { org: orgLogin, number: projectNumber });
  const project = res?.organization?.projectV2;
  if (!project?.id) {
    throw new Error(`Could not find org projectV2 ${orgLogin}#${projectNumber}`);
  }

  const mapped = mapProjectFields(project.fields?.nodes || []);

  return {
    projectId: project.id,
    projectTitle: project.title,
    ...mapped,
  };
}

async function getProjectItemForContent({ graphql, projectNumber, contentNodeId }) {
  const query = `
    query($id: ID!) {
      node(id: $id) {
        __typename
        ... on Issue {
          url
          state
          closedAt
          projectItems(first: 50) {
            nodes { id project { id number } }
          }
        }
        ... on PullRequest {
          url
          state
          merged
          mergedAt
          closedAt
          projectItems(first: 50) {
            nodes { id project { id number } }
          }
        }
      }
    }
  `;

  const res = await graphql(query, { id: contentNodeId });
  const node = res?.node;
  if (!node) return null;

  const items = node?.projectItems?.nodes || [];
  const item = items.find((it) => it?.project?.number === projectNumber);

  return {
    content: node,
    itemId: item?.id || null,
    projectId: item?.project?.id || null,
  };
}

async function setSingleSelect({ graphql, projectId, itemId, fieldId, optionId }) {
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { singleSelectOptionId: $optionId }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;
  await graphql(mutation, { projectId, itemId, fieldId, optionId });
}

async function setDate({ graphql, projectId, itemId, fieldId, date }) {
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $date: Date!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { date: $date }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;
  await graphql(mutation, { projectId, itemId, fieldId, date });
}

async function setBoolean({ graphql, projectId, itemId, fieldId, value }) {
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: Boolean!) {
      updateProjectV2ItemFieldValue(
        input: {
          projectId: $projectId
          itemId: $itemId
          fieldId: $fieldId
          value: { boolean: $value }
        }
      ) {
        projectV2Item { id }
      }
    }
  `;
  await graphql(mutation, { projectId, itemId, fieldId, value });
}

async function setNeedsDecisionFalse({ graphql, core, meta, projectId, itemId }) {
  const f = meta.needsDecisionField;
  if (!f?.id) return;

  if (f.dataType === 'BOOLEAN') {
    await setBoolean({ graphql, projectId, itemId, fieldId: f.id, value: false });
    return;
  }

  if (f.dataType === 'SINGLE_SELECT') {
    const options = f.options || [];
    const falseNames = new Set(['false', 'no', 'n', '0', 'none', 'clear']);
    const opt = options.find((o) => falseNames.has(normalize(o.name)));
    if (opt?.id) {
      await setSingleSelect({ graphql, projectId, itemId, fieldId: f.id, optionId: opt.id });
    } else {
      const names = options.map((o) => o?.name).filter(Boolean);
      core.warning(
        `Needs decision is SINGLE_SELECT but no obvious false option found; skipping clear. Options=${JSON.stringify(names)}. ${schemaHelp()}`
      );
    }
    return;
  }

  core.warning(`Needs decision field has unsupported dataType=${f.dataType}; skipping clear. ${schemaHelp()}`);
}

async function syncOneItem({ graphql, core, meta, projectId, itemId, doneDate }) {
  if (!projectId || !itemId) return;

  const mutations = [];

  if (meta.statusField?.id && meta.statusDoneOptionId) {
    mutations.push(
      setSingleSelect({
        graphql,
        projectId,
        itemId,
        fieldId: meta.statusField.id,
        optionId: meta.statusDoneOptionId,
      })
    );
  } else {
    if (!meta.statusField?.id) {
      core.warning(`Project schema drift: missing field "Status" (SINGLE_SELECT with option "Done"). ${schemaHelp()}`);
    } else if (meta.statusField?.dataType && meta.statusField.dataType !== 'SINGLE_SELECT') {
      core.warning(
        `Project schema drift: field "Status" has dataType=${meta.statusField.dataType}; expected SINGLE_SELECT. ${schemaHelp()}`
      );
    } else {
      const names = (meta.statusField?.options || []).map((o) => o?.name).filter(Boolean);
      core.warning(
        `Project schema drift: Status field missing option "Done"; skipping Status update. Options=${JSON.stringify(names)}. ${schemaHelp()}`
      );
    }
  }

  if (meta.doneDateField?.id) {
    const date = doneDate || yyyyMmDd(new Date());
    if (date) {
      mutations.push(setDate({ graphql, projectId, itemId, fieldId: meta.doneDateField.id, date }));
    }
  } else {
    core.warning(
      `Project schema drift: Done date field not found; skipping Done date update. Expected DATE field named "Done date" (also accepts "Done_date" or "Done"). ${schemaHelp()}`
    );
  }

  // Clear Needs decision
  mutations.push(setNeedsDecisionFalse({ graphql, core, meta, projectId, itemId }));

  // Execute sequentially to make troubleshooting easier & reduce rate-limit spikes
  for (const m of mutations) {
    try {
      await m;
    } catch (e) {
      core.warning(`Field update failed: ${e?.message || e}`);
    }
  }
}

async function reconcileProject({ graphql, core, meta, orgLogin, projectNumber }) {
  core.info(`Reconciling items in ${orgLogin} Project #${projectNumber} (${meta.projectTitle})`);

  const query = `
    query($projectId: ID!, $after: String) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 50, after: $after) {
            pageInfo { hasNextPage endCursor }
            nodes {
              id
              content {
                __typename
                ... on Issue {
                  url
                  state
                  closedAt
                }
                ... on PullRequest {
                  url
                  state
                  merged
                  mergedAt
                  closedAt
                }
              }
            }
          }
        }
      }
    }
  `;

  let after = null;
  let processed = 0;
  let updated = 0;

  while (true) {
    const res = await graphql(query, { projectId: meta.projectId, after });
    const items = res?.node?.items?.nodes || [];
    const pageInfo = res?.node?.items?.pageInfo;

    for (const it of items) {
      processed += 1;
      const c = it.content;
      if (!c) continue;

      let shouldMarkDone = false;
      let doneDate = null;

      if (c.__typename === 'Issue') {
        shouldMarkDone = c.state === 'CLOSED';
        doneDate = yyyyMmDd(c.closedAt);
      } else if (c.__typename === 'PullRequest') {
        shouldMarkDone = Boolean(c.merged);
        doneDate = yyyyMmDd(c.mergedAt || c.closedAt);
      }

      if (!shouldMarkDone) continue;

      core.info(`Syncing closed content: ${c.url}`);
      await syncOneItem({ graphql, core, meta, projectId: meta.projectId, itemId: it.id, doneDate });
      updated += 1;

      if (updated >= 200) {
        core.warning('Safety stop: reached 200 updates in one run.');
        return { processed, updated, stopped: true };
      }
    }

    if (!pageInfo?.hasNextPage) break;
    after = pageInfo.endCursor;

    // Safety: don't scan unbounded projects
    if (processed >= 1000) {
      core.warning('Safety stop: scanned 1000 items; stopping.');
      return { processed, updated, stopped: true };
    }
  }

  return { processed, updated, stopped: false };
}

async function run({ github, context, core, env }) {
  const orgLogin = env.ORG_LOGIN;
  const projectNumber = Number(env.PROJECT_NUMBER);

  const reconcile =
    context.eventName === 'schedule' ||
    (context.eventName === 'workflow_dispatch' && String(context.payload?.inputs?.reconcile ?? 'true') !== 'false');

  const graphql = github.graphql;

  // --- Main ---
  let meta = null;
  try {
    meta = await getProjectMetadata({ graphql, orgLogin, projectNumber });
  } catch (e) {
    core.info(`Project metadata unavailable; skipping Project sync. ${e?.message || e}`);
    return;
  }

  if (reconcile) {
    const res = await reconcileProject({ graphql, core, meta, orgLogin, projectNumber });
    core.info(`Reconcile complete. scanned=${res.processed}, updated=${res.updated}, stopped=${res.stopped}`);
    return;
  }

  let contentNodeId = null;
  if (context.eventName === 'issues') {
    contentNodeId = context.payload?.issue?.node_id;
  } else if (context.eventName === 'pull_request') {
    contentNodeId = context.payload?.pull_request?.node_id;
    const merged = Boolean(context.payload?.pull_request?.merged);
    if (!merged) {
      core.info('PR was closed but not merged; nothing to do.');
      return;
    }
  }

  if (!contentNodeId) {
    core.info('No content node id found in event payload; nothing to do.');
    return;
  }

  const itemRes = await getProjectItemForContent({ graphql, projectNumber, contentNodeId });
  const { content, itemId, projectId } = itemRes || {};
  if (!itemId) {
    core.info('Content is not in Project #1; nothing to do.');
    return;
  }

  const doneDate = yyyyMmDd(content.__typename === 'PullRequest' ? content.mergedAt || content.closedAt : content.closedAt);

  core.info(`Syncing Project item for ${content.url}`);
  await syncOneItem({ graphql, core, meta, projectId: meta.projectId || projectId, itemId, doneDate });
}

module.exports = {
  SCHEMA_HELP_DOC,
  SCHEMA_HELP_ANCHOR,
  schemaHelp,
  normalize,
  yyyyMmDd,
  mapProjectFields,
  getProjectMetadata,
  syncOneItem,
  run,
};
