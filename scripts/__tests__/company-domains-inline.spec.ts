/**
 * Lint: every source-company-* plugin that declares `companyDomains` must use
 * an inline array of quoted string literals. Constant/variable references are
 * not picked up by the upstream domain scanner, and `www.` prefixes are
 * redundant because the host normalizer strips them.
 */
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

interface Violation {
  file: string;
  reason: string;
}

const REPO_PLUGINS_DIR = path.join(
  __dirname,
  '..',
  '..',
  'packages',
  'plugins',
);

export function checkCompanyDomains(text: string): {
  ok: boolean;
  violation?: string;
} {
  const hasDecl = /companyDomains\s*:/s.test(text);
  if (!hasDecl) {
    return { ok: true };
  }

  const match = text.match(/companyDomains\s*:\s*(\[[\s\S]*?\])/);
  if (!match) {
    return { ok: false, violation: 'companyDomains is not an inline array literal' };
  }

  const inner = match[1].slice(1, -1);
  const items = inner
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('//'));

  for (const item of items) {
    const quoted = /^(['"])([^'"]*)\1$/.exec(item);
    if (!quoted) {
      return {
        ok: false,
        violation: `companyDomains entry is not a string literal: ${item}`,
      };
    }
    const domain = quoted[2];
    if (domain.startsWith('www.')) {
      return {
        ok: false,
        violation: `companyDomains entry has www. prefix: ${domain}`,
      };
    }
  }

  return { ok: true };
}

export async function lintCompanyPlugins(
  pluginsDir: string,
): Promise<Violation[]> {
  const violations: Violation[] = [];
  const entries = await fs.readdir(pluginsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith('source-company-')) {
      continue;
    }

    const srcDir = path.join(pluginsDir, entry.name, 'src');
    let files: string[];
    try {
      files = await fs.readdir(srcDir);
    } catch {
      continue;
    }

    const serviceFile = files.find((f) => f.endsWith('.service.ts'));
    if (!serviceFile) {
      continue;
    }

    const filePath = path.join(srcDir, serviceFile);
    const text = await fs.readFile(filePath, 'utf8');
    const result = checkCompanyDomains(text);
    if (!result.ok) {
      violations.push({
        file: path.relative(pluginsDir, filePath),
        reason: result.violation!,
      });
    }
  }

  return violations;
}

async function makeRepo(layout: Record<string, string>): Promise<string> {
  const root = await fs.mkdtemp(
    path.join(os.tmpdir(), 'ever-jobs-company-domains-'),
  );
  for (const [rel, body] of Object.entries(layout)) {
    const abs = path.join(root, rel);
    await fs.mkdir(path.dirname(abs), { recursive: true });
    await fs.writeFile(abs, body, 'utf8');
  }
  return root;
}

async function rmRf(p: string | null): Promise<void> {
  if (!p) return;
  await fs.rm(p, { recursive: true, force: true });
}

describe('companyDomains inline-array lint', () => {
  describe('checkCompanyDomains', () => {
    it('passes for an inline single-domain array', () => {
      const text = `@SourcePlugin({\n  companyDomains: ['example.com'],\n})`;
      expect(checkCompanyDomains(text)).toEqual({ ok: true });
    });

    it('passes for an inline multi-domain array', () => {
      const text = `@SourcePlugin({\n  companyDomains: [\n    'example.com',\n    'example.org',\n  ],\n})`;
      expect(checkCompanyDomains(text)).toEqual({ ok: true });
    });

    it('passes when companyDomains is absent', () => {
      const text = `@SourcePlugin({\n  site: Site.FOO,\n})`;
      expect(checkCompanyDomains(text)).toEqual({ ok: true });
    });

    it('fails when companyDomains is a constant reference', () => {
      const text = `@SourcePlugin({\n  companyDomains: FOO_DOMAINS,\n})`;
      const result = checkCompanyDomains(text);
      expect(result.ok).toBe(false);
      expect(result.violation).toContain('not an inline array literal');
    });

    it('fails when an entry is not a string literal', () => {
      const text = `@SourcePlugin({\n  companyDomains: [example],\n})`;
      const result = checkCompanyDomains(text);
      expect(result.ok).toBe(false);
      expect(result.violation).toContain('not a string literal');
    });

    it('fails when an entry starts with www.', () => {
      const text = `@SourcePlugin({\n  companyDomains: ['www.example.com'],\n})`;
      const result = checkCompanyDomains(text);
      expect(result.ok).toBe(false);
      expect(result.violation).toContain('www. prefix');
    });

    it('passes for an empty inline array', () => {
      const text = `@SourcePlugin({\n  companyDomains: [],\n})`;
      expect(checkCompanyDomains(text)).toEqual({ ok: true });
    });
  });

  describe('lintCompanyPlugins', () => {
    let tempRoot: string | null = null;

    afterEach(async () => {
      await rmRf(tempRoot);
      tempRoot = null;
    });

    it('returns no violations for a compliant temp repo', async () => {
      tempRoot = await makeRepo({
        'packages/plugins/source-company-good/src/good.service.ts': `@SourcePlugin({\n  companyDomains: ['good.com'],\n})\nexport class GoodService {}`,
      });
      const violations = await lintCompanyPlugins(
        path.join(tempRoot, 'packages', 'plugins'),
      );
      expect(violations).toEqual([]);
    });

    it('returns a violation for a constant reference', async () => {
      tempRoot = await makeRepo({
        'packages/plugins/source-company-bad/src/bad.service.ts': `@SourcePlugin({\n  companyDomains: BAD_DOMAINS,\n})\nexport class BadService {}`,
      });
      const violations = await lintCompanyPlugins(
        path.join(tempRoot, 'packages', 'plugins'),
      );
      expect(violations).toHaveLength(1);
      expect(violations[0].reason).toContain('not an inline array literal');
    });

    it('ignores non-source-company packages', async () => {
      tempRoot = await makeRepo({
        'packages/plugins/source-ats-foo/src/foo.service.ts': `@SourcePlugin({\n  companyDomains: FOO_DOMAINS,\n})\nexport class FooService {}`,
      });
      const violations = await lintCompanyPlugins(
        path.join(tempRoot, 'packages', 'plugins'),
      );
      expect(violations).toEqual([]);
    });
  });

  describe('current repo scan', () => {
    it('has no companyDomains violations in packages/plugins', async () => {
      const violations = await lintCompanyPlugins(REPO_PLUGINS_DIR);
      expect(violations).toEqual([]);
    });
  });
});
