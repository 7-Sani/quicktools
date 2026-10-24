import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isNonPublicIpv4,
  isNonPublicIpv6,
  isBlockedHostname,
  validateAndResolveTarget,
} from "../src/lib/ssrfProtection";

describe("SSRF Protection & Address Validation", () => {
  describe("IPv4 Address Filtering", () => {
    it("identifies IPv4 loopback addresses as non-public", () => {
      assert.strictEqual(isNonPublicIpv4("127.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("127.0.0.254"), true);
      assert.strictEqual(isNonPublicIpv4("127.255.255.255"), true);
    });

    it("identifies RFC 1918 private IPv4 subnets as non-public", () => {
      // 10.0.0.0/8
      assert.strictEqual(isNonPublicIpv4("10.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("10.255.255.254"), true);

      // 172.16.0.0/12
      assert.strictEqual(isNonPublicIpv4("172.16.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("172.31.255.254"), true);
      assert.strictEqual(isNonPublicIpv4("172.32.0.1"), false); // Public

      // 192.168.0.0/16
      assert.strictEqual(isNonPublicIpv4("192.168.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("192.168.254.254"), true);
    });

    it("identifies link-local and cloud metadata addresses as non-public", () => {
      assert.strictEqual(isNonPublicIpv4("169.254.169.254"), true);
      assert.strictEqual(isNonPublicIpv4("169.254.1.1"), true);
    });

    it("identifies carrier-grade NAT, multicast, broadcast, and reserved as non-public", () => {
      assert.strictEqual(isNonPublicIpv4("0.0.0.0"), true);
      assert.strictEqual(isNonPublicIpv4("100.64.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("224.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("240.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv4("255.255.255.255"), true);
    });

    it("permits globally routable public IPv4 addresses", () => {
      assert.strictEqual(isNonPublicIpv4("8.8.8.8"), false);
      assert.strictEqual(isNonPublicIpv4("1.1.1.1"), false);
      assert.strictEqual(isNonPublicIpv4("93.184.216.34"), false);
      assert.strictEqual(isNonPublicIpv4("142.250.190.46"), false);
    });
  });

  describe("IPv6 Address Filtering", () => {
    it("identifies IPv6 loopback and unspecified as non-public", () => {
      assert.strictEqual(isNonPublicIpv6("::1"), true);
      assert.strictEqual(isNonPublicIpv6("::"), true);
      assert.strictEqual(isNonPublicIpv6("0:0:0:0:0:0:0:1"), true);
    });

    it("identifies IPv4-mapped IPv6 addresses embedding private IPs as non-public", () => {
      assert.strictEqual(isNonPublicIpv6("::ffff:127.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv6("::ffff:10.0.0.1"), true);
      assert.strictEqual(isNonPublicIpv6("::ffff:192.168.1.1"), true);
      assert.strictEqual(isNonPublicIpv6("::ffff:169.254.169.254"), true);
    });

    it("identifies link-local, unique local ULA, and multicast IPv6 as non-public", () => {
      assert.strictEqual(isNonPublicIpv6("fe80::1"), true);
      assert.strictEqual(isNonPublicIpv6("fe80::dead:beef"), true);
      assert.strictEqual(isNonPublicIpv6("fc00::1"), true);
      assert.strictEqual(isNonPublicIpv6("fd12:3456:789a::1"), true);
      assert.strictEqual(isNonPublicIpv6("ff02::1"), true);
    });

    it("permits globally routable public IPv6 addresses", () => {
      assert.strictEqual(isNonPublicIpv6("2606:4700:4700::1111"), false);
      assert.strictEqual(isNonPublicIpv6("2001:4860:4860::8888"), false);
    });
  });

  describe("Hostname and Target URL Validation", () => {
    it("blocks localhost and local network hostnames", () => {
      assert.strictEqual(isBlockedHostname("localhost"), true);
      assert.strictEqual(isBlockedHostname("app.localhost"), true);
      assert.strictEqual(isBlockedHostname("server.local"), true);
      assert.strictEqual(isBlockedHostname("db.internal"), true);
      assert.strictEqual(isBlockedHostname("router.lan"), true);
    });

    it("rejects non-HTTP/HTTPS protocols", async () => {
      await assert.rejects(
        () => validateAndResolveTarget("ftp://example.com/file.txt"),
        /Only HTTP and HTTPS protocols are supported/
      );
      await assert.rejects(
        () => validateAndResolveTarget("file:///etc/passwd"),
        /Only HTTP and HTTPS protocols are supported/
      );
      await assert.rejects(
        () => validateAndResolveTarget("gopher://example.com"),
        /Only HTTP and HTTPS protocols are supported/
      );
    });

    it("rejects non-standard service ports (port-scanning SSRF prevention)", async () => {
      await assert.rejects(
        () => validateAndResolveTarget("http://example.com:22"),
        /Port 22 is not permitted/
      );
      await assert.rejects(
        () => validateAndResolveTarget("http://example.com:6379"),
        /Port 6379 is not permitted/
      );
      await assert.rejects(
        () => validateAndResolveTarget("http://example.com:5432"),
        /Port 5432 is not permitted/
      );
    });

    it("rejects direct requests to localhost and private IPs", async () => {
      await assert.rejects(
        () => validateAndResolveTarget("http://127.0.0.1/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
      await assert.rejects(
        () => validateAndResolveTarget("http://[::1]/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
      await assert.rejects(
        () => validateAndResolveTarget("http://169.254.169.254/latest/meta-data/"),
        /Requests to localhost, private domains, or local network addresses are blocked|The specified IP address belongs to a private or restricted network range/
      );
    });

    it("rejects alternative IP representations of loopback and private networks", async () => {
      // Decimal / integer format (2130706433 === 127.0.0.1)
      await assert.rejects(
        () => validateAndResolveTarget("http://2130706433/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
      // Hexadecimal format (0x7f000001 === 127.0.0.1)
      await assert.rejects(
        () => validateAndResolveTarget("http://0x7f000001/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
      // Octal format (0177.0.0.1 === 127.0.0.1)
      await assert.rejects(
        () => validateAndResolveTarget("http://0177.0.0.1/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
      // IPv4-mapped IPv6 ([::ffff:127.0.0.1])
      await assert.rejects(
        () => validateAndResolveTarget("http://[::ffff:127.0.0.1]/"),
        /Requests to localhost, private domains, or local network addresses are blocked/
      );
    });

    it("resolves and approves legitimate public domain targets", async () => {
      const result = await validateAndResolveTarget("https://dns.google");
      assert.ok(result.url);
      assert.strictEqual(result.url.hostname, "dns.google");
      assert.ok(result.resolvedIp);
      assert.strictEqual(isNonPublicIpv4(result.resolvedIp) && isNonPublicIpv6(result.resolvedIp), false);
    });
  });
});
