import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { resolveProjectsAuthConfig, selectProjectsToken } = require('../../.github/scripts/projects-auth.cjs');

describe('projects-auth', () => {
  describe('resolveProjectsAuthConfig', () => {
    it('detects GitHub App config only when both app id and private key are present', () => {
      expect(
        resolveProjectsAuthConfig({
          projectsAppId: '123',
          projectsAppPrivateKey: '---KEY---',
          projectStatusSyncToken: '',
        })
      ).toEqual({ useApp: true, appId: '123', hasPat: false });

      expect(
        resolveProjectsAuthConfig({
          projectsAppId: '123',
          projectsAppPrivateKey: '',
          projectStatusSyncToken: '',
        })
      ).toEqual({ useApp: false, appId: '123', hasPat: false });
    });

    it('detects PAT presence', () => {
      expect(
        resolveProjectsAuthConfig({
          projectsAppId: '',
          projectsAppPrivateKey: '',
          projectStatusSyncToken: 'pat_abc',
        }).hasPat
      ).toBe(true);
    });
  });

  describe('selectProjectsToken', () => {
    it('returns empty when no tokens are available', () => {
      expect(selectProjectsToken({ appToken: '', patToken: '' })).toEqual({ token: '', source: '' });
    });

    it('prefers App token over PAT when both are present', () => {
      expect(selectProjectsToken({ appToken: 'app_token', patToken: 'pat_token' })).toEqual({
        token: 'app_token',
        source: 'app',
      });
    });

    it('falls back to PAT token when App token is missing', () => {
      expect(selectProjectsToken({ appToken: '', patToken: 'pat_token' })).toEqual({
        token: 'pat_token',
        source: 'pat',
      });
    });
  });
});
