'use strict';

const DEFAULT_RETRY_ATTEMPTS = 6;
const DEFAULT_RETRY_DELAY_MS = 10_000;

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

function toBool(v, defaultValue = false) {
  if (v == null) return defaultValue;
  const s = String(v).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return defaultValue;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function labelsFromContext({ context }) {
  if (context.eventName === 'issues') {
    return (context.payload?.issue?.labels || []).map((l) => l?.name).filter(Boolean);
  }

  if (context.eventName === 'pull_request') {
    return (context.payload?.pull_request?.labels || []).map((l) => l?.name).filter(Boolean);
  }

  return [];
}

function contentNodeIdFromContext({ context }) {
  if (context.eventName === 'issues') return context.payload?.issue?.node_id || null;
  if (context.eventName === 'pull_request') return context.payload?.pull_request?.node_id || null;
  return null;
}

async function getProjectItemForContent({ graphql, projectNumber, contentNodeId }) {
  const query = `
    query($id: ID!) {
      node(id: $id) {
        __typename
        ... on Issue {
          url
          projectItems(first: 50) {
            nodes { id project { id number } }
          }
        }
        ... on PullRequest {
          url
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

async function deleteProjectItem({ graphql, projectId, itemId }) {
  const mutation = `
    mutation($projectId: ID!, $itemId: ID!) {
      deleteProjectV2Item(input: { projectId: $projectId, itemId: $itemId }) {
        deletedItemId
      }
    }
  `;

  const res = await graphql(mutation, { projectId, itemId });
  return res?.deleteProjectV2Item?.deletedItemId || null;
}

async function cleanupOne({ graphql, core, projectNumber, contentNodeId, projectIdHint, retryAttempts, retryDelayMs }) {
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    const itemRes = await getProjectItemForContent({ graphql, projectNumber, contentNodeId });
    const { content, itemId, projectId } = itemRes || {};

    if (itemId) {
      const effectiveProjectId = projectIdHint || projectId;
      if (!effectiveProjectId) {
        throw new Error('Found Project itemId but no projectId available; cannot delete.');
      }

      const deleted = await deleteProjectItem({ graphql, projectId: effectiveProjectId, itemId });
      core.info(`Removed from Project #${projectNumber}: ${content?.url || contentNodeId} (deletedItemId=${deleted || 'unknown'})`);
      return { removed: true };
    }

    if (attempt < retryAttempts) {
      core.info(
        `Not in Project #${projectNumber} yet (attempt ${attempt}/${retryAttempts}); waiting ${retryDelayMs}ms to re-check…`
      );
      await sleep(retryDelayMs);
      continue;
    }

    core.info(`Content is not in Project #${projectNumber}; nothing to do.`);
    return { removed: false };
  }

  return { removed: false };
}

async function searchAutomationLabeledItems({ graphql, owner, repo, label, max = 50 }) {
  const query = `repo:${owner}/${repo} label:"${label}"`;

  const q = `
    query($q: String!, $n: Int!) {
      search(type: ISSUE, query: $q, first: $n) {
        nodes {
          __typename
          ... on Issue { id url }
          ... on PullRequest { id url }
        }
      }
    }
  `;

  const res = await graphql(q, { q: query, n: max });
  const nodes = res?.search?.nodes || [];
  return nodes.filter((n) => n?.id);
}

async function cleanupAllAutomationItems({ github, context, core, env }) {
  const label = env?.AUTOMATION_LABEL || 'automation';
  const projectNumber = Number(env?.PROJECT_NUMBER || 1);
  const { owner, repo } = context.repo;

  const retryAttempts = Number(env?.RETRY_ATTEMPTS || DEFAULT_RETRY_ATTEMPTS);
  const retryDelayMs = Number(env?.RETRY_DELAY_MS || DEFAULT_RETRY_DELAY_MS);

  const graphql = github.graphql;

  core.info(`Searching for items labeled '${label}' to remove from Project #${projectNumber}…`);
  const nodes = await searchAutomationLabeledItems({ graphql, owner, repo, label, max: 50 });
  core.info(`Found ${nodes.length} item(s) labeled '${label}'.`);

  let removed = 0;
  for (const node of nodes) {
    const res = await cleanupOne({
      graphql,
      core,
      projectNumber,
      contentNodeId: node.id,
      projectIdHint: null,
      retryAttempts,
      retryDelayMs,
    });
    if (res.removed) removed += 1;
  }

  core.info(`Cleanup complete. removed=${removed}/${nodes.length}`);
}

async function run({ github, context, core, env }) {
  const automationLabel = env?.AUTOMATION_LABEL || 'automation';
  const projectNumber = Number(env?.PROJECT_NUMBER || 1);

  const retryAttempts = Number(env?.RETRY_ATTEMPTS || DEFAULT_RETRY_ATTEMPTS);
  const retryDelayMs = Number(env?.RETRY_DELAY_MS || DEFAULT_RETRY_DELAY_MS);

  const cleanupAll =
    context.eventName === 'workflow_dispatch' &&
    toBool(context.payload?.inputs?.cleanup_all, false);

  if (cleanupAll) {
    await cleanupAllAutomationItems({ github, context, core, env });
    return;
  }

  const labels = labelsFromContext({ context }).map(normalize);
  if (!labels.includes(normalize(automationLabel))) {
    core.info(`No '${automationLabel}' label detected; nothing to do.`);
    return;
  }

  const contentNodeId = contentNodeIdFromContext({ context });
  if (!contentNodeId) {
    core.info('No content node id found in event payload; nothing to do.');
    return;
  }

  const graphql = github.graphql;

  core.info(`Detected '${automationLabel}' label; ensuring item is not in Project #${projectNumber}…`);

  await cleanupOne({
    graphql,
    core,
    projectNumber,
    contentNodeId,
    projectIdHint: null,
    retryAttempts,
    retryDelayMs,
  });
}

module.exports = {
  run,
};
