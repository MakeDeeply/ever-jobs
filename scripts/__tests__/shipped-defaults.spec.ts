/**
 * The recipes we ship (the published image's Dockerfile, both compose files and
 * the example k8s manifest) must not turn on what the app keeps off by default.
 * The owner's rule: Ever Jobs does not cache or persist search results unless an
 * operator opts in. The app default lives in `apps/api/src/config/configuration.ts`
 * (`ENABLE_CACHE` → false) and `store-config.ts` (`EVER_JOBS_PERSIST_SEARCH` →
 * false for the memory store); a forker running the GHCR image or `docker compose
 * up` must get the same.
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const read = (rel: string): string => fs.readFileSync(path.join(REPO_ROOT, rel), 'utf8');

/** `ENV NAME=value` lines of a Dockerfile (last one wins, like Docker). */
export function dockerfileEnv(text: string): Map<string, string> {
  const env = new Map<string, string>();
  for (const line of text.split('\n')) {
    const m = /^\s*ENV\s+([A-Z0-9_]+)=(\S*)\s*$/.exec(line);
    if (m) env.set(m[1], m[2]);
  }
  return env;
}

/** Defaults of `NAME: ${NAME:-default}` entries of a compose file. */
export function composeDefaults(text: string): Map<string, string> {
  const env = new Map<string, string>();
  for (const line of text.split('\n')) {
    const m = /^\s*([A-Z0-9_]+):\s*\$\{([A-Z0-9_]+):-([^}]*)\}\s*$/.exec(line);
    if (m && m[1] === m[2]) env.set(m[1], m[3]);
  }
  return env;
}

/** `- name: NAME` + `value: "x"` pairs of a k8s manifest's container env. */
export function manifestEnv(text: string): Map<string, string> {
  const env = new Map<string, string>();
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const name = /^\s*-\s*name:\s*([A-Z0-9_]+)\s*$/.exec(lines[i]);
    if (!name) continue;
    for (let j = i + 1; j < lines.length && j <= i + 3; j++) {
      if (/^\s*-\s*name:/.test(lines[j])) break;
      const value = /^\s*value:\s*"?([^"]*)"?\s*$/.exec(lines[j]);
      if (value) {
        env.set(name[1], value[1]);
        break;
      }
    }
  }
  return env;
}

describe('shipped recipes keep caching and persistence off (owner rule)', () => {
  it('the app defaults are off (the source of truth the recipes must match)', () => {
    expect(read('apps/api/src/config/configuration.ts')).toContain('enabled: parseBool(process.env.ENABLE_CACHE, false)');
  });

  it('the Dockerfile (published image) does not enable the cache', () => {
    const env = dockerfileEnv(read('Dockerfile'));
    // Control: the parser finds the variable, so `false` below is read, not assumed.
    expect(env.has('ENABLE_CACHE')).toBe(true);
    expect(env.get('ENABLE_CACHE')).toBe('false');
    expect(env.get('EVER_JOBS_PERSIST_SEARCH') ?? 'false').toBe('false');
  });

  it.each(['docker-compose.yml', 'docker-compose.dev.yml'])('%s defaults ENABLE_CACHE to false', (file) => {
    const env = composeDefaults(read(file));
    expect(env.has('ENABLE_CACHE')).toBe(true); // control: the default is read, not assumed
    expect(env.get('ENABLE_CACHE')).toBe('false');
    expect(env.get('EVER_JOBS_PERSIST_SEARCH') ?? 'false').toBe('false');
  });

  it('the example prod manifest does not enable the cache or persistence', () => {
    const env = manifestEnv(read('.deploy/k8s/k8s-manifest.prod.yaml'));
    expect(env.has('ENABLE_CACHE')).toBe(true); // control: the value is read, not assumed
    expect(env.get('ENABLE_CACHE')).toBe('false');
    expect(env.get('EVER_JOBS_PERSIST_SEARCH') ?? 'false').toBe('false');
  });

  it('the parsers catch an enabling value (red control)', () => {
    expect(dockerfileEnv('ENV ENABLE_CACHE=true\n').get('ENABLE_CACHE')).toBe('true');
    expect(composeDefaults('      ENABLE_CACHE: ${ENABLE_CACHE:-true}\n').get('ENABLE_CACHE')).toBe('true');
    expect(manifestEnv('            - name: ENABLE_CACHE\n              value: "true"\n').get('ENABLE_CACHE')).toBe('true');
  });
});
