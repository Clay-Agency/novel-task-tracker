'use strict';

const fs = require('node:fs');

const { selectProjectsToken } = require('./projects-auth.cjs');

function setOutput(key, value) {
  const outPath = process.env.GITHUB_OUTPUT;
  if (!outPath) {
    // eslint-disable-next-line no-console
    console.log(`::notice title=GITHUB_OUTPUT missing::${key}=${value}`);
    return;
  }
  fs.appendFileSync(outPath, `${key}=${value}\n`, { encoding: 'utf8' });
}

const { token, source } = selectProjectsToken({
  appToken: process.env.APP_TOKEN,
  patToken: process.env.PAT_TOKEN,
});

setOutput('token', token);
setOutput('source', source);
