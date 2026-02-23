'use strict';

const fs = require('node:fs');

const { resolveProjectsAuthConfig } = require('./projects-auth.cjs');

function setOutput(key, value) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (!outPath) {
    // best-effort fallback for local/dev runs
    // eslint-disable-next-line no-console
    console.log(`::notice title=GITHUB_OUTPUT missing::${key}=${value}`);
    return;
  }
  fs.appendFileSync(outPath, `${key}=${value}\n`, { encoding: 'utf8' });
}

const cfg = resolveProjectsAuthConfig({
  projectsAppId: process.env.PROJECTS_APP_ID,
  projectsAppPrivateKey: process.env.PROJECTS_APP_PRIVATE_KEY,
  projectStatusSyncToken: process.env.PROJECT_STATUS_SYNC_TOKEN,
});

setOutput('use_app', cfg.useApp ? 'true' : 'false');
if (cfg.useApp) setOutput('app_id', cfg.appId);
setOutput('has_pat', cfg.hasPat ? 'true' : 'false');
