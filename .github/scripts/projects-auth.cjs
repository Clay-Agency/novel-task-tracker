'use strict';

function truthy(v) {
  return typeof v === 'string' ? v.trim().length > 0 : Boolean(v);
}

function resolveProjectsAuthConfig({ projectsAppId, projectsAppPrivateKey, projectStatusSyncToken }) {
  const hasAppId = truthy(projectsAppId);
  const hasAppKey = truthy(projectsAppPrivateKey);

  return {
    useApp: hasAppId && hasAppKey,
    appId: hasAppId ? String(projectsAppId).trim() : '',
    hasPat: truthy(projectStatusSyncToken),
  };
}

function selectProjectsToken({ appToken, patToken }) {
  const app = typeof appToken === 'string' ? appToken.trim() : '';
  const pat = typeof patToken === 'string' ? patToken.trim() : '';

  if (app) return { token: app, source: 'app' };
  if (pat) return { token: pat, source: 'pat' };
  return { token: '', source: '' };
}

module.exports = {
  resolveProjectsAuthConfig,
  selectProjectsToken,
};
