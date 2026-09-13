import { isPubliclyRoutableBoardHost } from '../src/recruitee.constants';

/**
 * Spec 5100 widened this plugin from a board pinned to `*.recruitee.com` to one
 * that fetches whatever origin `companyUrl` (or a dotted `companySlug`) names,
 * so that customers on their own career domain work. That is the right feature
 * and the wrong blast radius: unlike the headful plugins hardened in Spec 1687,
 * this path runs on `axios`, which is live in every deployed environment.
 *
 * The guard keeps every public custom domain working and refuses the hosts a
 * real board is never served from.
 */
describe('isPubliclyRoutableBoardHost', () => {
  describe('accepts real board hosts', () => {
    it.each([
      'acme.recruitee.com',
      'careers.acme.com',
      'jobs.example.co.uk',
      'werken.bol.com',
      // A public IPv4 literal is unusual for a board but not forbidden.
      '93.184.216.34',
      '2606:2800:220:1:248:1893:25c8:1946',
    ])('%s', (host) => {
      expect(isPubliclyRoutableBoardHost(host)).toBe(true);
    });
  });

  describe('refuses hosts no customer board lives on', () => {
    it.each([
      // Cloud metadata — the classic SSRF target.
      ['169.254.169.254', 'link-local'],
      ['127.0.0.1', 'loopback'],
      ['0.0.0.0', 'this-host'],
      ['10.1.2.3', 'private'],
      ['172.16.0.1', 'private'],
      ['172.31.255.254', 'private'],
      ['192.168.1.1', 'private'],
      ['100.64.0.1', 'CGNAT'],
      ['198.18.0.1', 'benchmarking'],
      ['224.0.0.1', 'multicast'],
      ['::1', 'IPv6 loopback'],
      ['[::1]', 'bracketed IPv6 loopback'],
      ['fd00::1', 'IPv6 unique-local'],
      ['fe80::1', 'IPv6 link-local'],
      ['localhost', 'localhost'],
      ['api.localhost', 'localhost subdomain'],
      // Cluster-internal names: no dot means the resolver appends a search domain.
      ['ever-jobs-api', 'bare in-cluster name'],
      ['db.internal', 'internal suffix'],
      ['printer.local', 'mDNS suffix'],
      ['', 'empty'],
    ])('%s (%s)', (host) => {
      expect(isPubliclyRoutableBoardHost(host)).toBe(false);
    });
  });

  it('keeps public hosts that merely resemble a private range', () => {
    // 172.32 is outside 172.16/12, and 100.128 is outside the CGNAT block.
    expect(isPubliclyRoutableBoardHost('172.32.0.1')).toBe(true);
    expect(isPubliclyRoutableBoardHost('100.128.0.1')).toBe(true);
    expect(isPubliclyRoutableBoardHost('11.0.0.1')).toBe(true);
  });
});
