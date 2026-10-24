import dns from "node:dns/promises";
import net from "node:net";

/**
 * Parses an IPv4 address string into an unsigned 32-bit integer.
 */
function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  return (((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0);
}

/**
 * Checks if a given IPv4 (as uint32) falls within a CIDR block.
 */
function inIpv4Range(ipInt: number, networkInt: number, maskBits: number): boolean {
  if (maskBits === 0) return true;
  const mask = ((0xffffffff << (32 - maskBits)) >>> 0);
  return (ipInt & mask) === (networkInt & mask);
}

/**
 * Determines whether an IPv4 address is non-public (loopback, private, multicast, link-local, reserved).
 */
export function isNonPublicIpv4(ip: string): boolean {
  let ipInt: number;
  try {
    ipInt = ipv4ToInt(ip);
  } catch {
    return true; // Treat invalid IPv4 as unsafe
  }

  // 0.0.0.0/8 (Current network / "this" network - RFC 1122)
  if (inIpv4Range(ipInt, 0x00000000, 8)) return true;

  // 10.0.0.0/8 (Private - RFC 1918)
  if (inIpv4Range(ipInt, 0x0a000000, 8)) return true;

  // 100.64.0.0/10 (Carrier-Grade NAT - RFC 6598)
  if (inIpv4Range(ipInt, 0x64400000, 10)) return true;

  // 127.0.0.0/8 (Loopback - RFC 1122)
  if (inIpv4Range(ipInt, 0x7f000000, 8)) return true;

  // 169.254.0.0/16 (Link-Local - RFC 3927)
  if (inIpv4Range(ipInt, 0xa9fe0000, 16)) return true;

  // 172.16.0.0/12 (Private - RFC 1918)
  if (inIpv4Range(ipInt, 0xac100000, 12)) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments - RFC 6890)
  if (inIpv4Range(ipInt, 0xc0000000, 24)) return true;

  // 192.0.2.0/24 (TEST-NET-1 Documentation - RFC 5737)
  if (inIpv4Range(ipInt, 0xc0000200, 24)) return true;

  // 192.88.99.0/24 (6to4 Relay Anycast - RFC 7526)
  if (inIpv4Range(ipInt, 0xc0586300, 24)) return true;

  // 192.168.0.0/16 (Private - RFC 1918)
  if (inIpv4Range(ipInt, 0xc0a80000, 16)) return true;

  // 198.18.0.0/15 (Benchmarking - RFC 2544)
  if (inIpv4Range(ipInt, 0xc6120000, 15)) return true;

  // 198.51.100.0/24 (TEST-NET-2 Documentation - RFC 5737)
  if (inIpv4Range(ipInt, 0xc6336400, 24)) return true;

  // 203.0.113.0/24 (TEST-NET-3 Documentation - RFC 5737)
  if (inIpv4Range(ipInt, 0xcb007100, 24)) return true;

  // 224.0.0.0/4 (Multicast - RFC 5771)
  if (inIpv4Range(ipInt, 0xe0000000, 4)) return true;

  // 240.0.0.0/4 (Reserved / Future Use - RFC 1112)
  if (inIpv4Range(ipInt, 0xf0000000, 4)) return true;

  // 255.255.255.255/32 (Broadcast)
  if (ipInt === 0xffffffff) return true;

  return false;
}

/**
 * Normalizes an IPv6 address into 8 16-bit blocks: [s0, s1, s2, s3, s4, s5, s6, s7].
 */
function parseIpv6Blocks(ip: string): number[] {
  let clean = ip.replace(/^\[|\]$/g, "").toLowerCase().trim();

  // Check if this is an IPv4-mapped IPv6 address (e.g. ::ffff:192.0.2.1)
  const lastColon = clean.lastIndexOf(":");
  const potentialIpv4 = clean.slice(lastColon + 1);
  if (potentialIpv4.includes(".")) {
    const ipv4Int = ipv4ToInt(potentialIpv4);
    const prefix = clean.slice(0, lastColon);
    const hex1 = ((ipv4Int >>> 16) & 0xffff).toString(16);
    const hex2 = (ipv4Int & 0xffff).toString(16);
    clean = `${prefix}:${hex1}:${hex2}`;
  }

  // Handle :: expansion
  const parts = clean.split("::");
  let segments: string[] = [];

  if (parts.length === 2) {
    const left = parts[0] ? parts[0].split(":") : [];
    const right = parts[1] ? parts[1].split(":") : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) throw new Error(`Invalid IPv6 address: ${ip}`);
    segments = [...left, ...Array(missing).fill("0"), ...right];
  } else if (parts.length === 1) {
    segments = clean.split(":");
  } else {
    throw new Error(`Invalid IPv6 address: ${ip}`);
  }

  if (segments.length !== 8) {
    throw new Error(`Invalid IPv6 address: ${ip}`);
  }

  return segments.map((seg) => {
    const num = parseInt(seg || "0", 16);
    if (isNaN(num) || num < 0 || num > 0xffff) {
      throw new Error(`Invalid IPv6 segment: ${seg}`);
    }
    return num;
  });
}

/**
 * Determines whether an IPv6 address is non-public.
 */
export function isNonPublicIpv6(ip: string): boolean {
  let blocks: number[];
  try {
    blocks = parseIpv6Blocks(ip);
  } catch {
    return true; // Treat unparseable IPv6 as unsafe
  }

  const [s0, s1, s2, s3, s4, s5, s6, s7] = blocks;

  // ::/128 (Unspecified)
  if (blocks.every((b) => b === 0)) return true;

  // ::1/128 (Loopback)
  if (s0 === 0 && s1 === 0 && s2 === 0 && s3 === 0 && s4 === 0 && s5 === 0 && s6 === 0 && s7 === 1) {
    return true;
  }

  // ::ffff:0:0/96 (IPv4-mapped IPv6)
  if (s0 === 0 && s1 === 0 && s2 === 0 && s3 === 0 && s4 === 0 && s5 === 0xffff) {
    const embeddedIpv4Int = ((s6 << 16) | s7) >>> 0;
    const octets = [
      (embeddedIpv4Int >>> 24) & 255,
      (embeddedIpv4Int >>> 16) & 255,
      (embeddedIpv4Int >>> 8) & 255,
      embeddedIpv4Int & 255,
    ].join(".");
    return isNonPublicIpv4(octets);
  }

  // 64:ff9b::/96 (IPv4/IPv6 translation - RFC 6052)
  if (s0 === 0x0064 && s1 === 0xff9b && s2 === 0 && s3 === 0 && s4 === 0 && s5 === 0) {
    const embeddedIpv4Int = ((s6 << 16) | s7) >>> 0;
    const octets = [
      (embeddedIpv4Int >>> 24) & 255,
      (embeddedIpv4Int >>> 16) & 255,
      (embeddedIpv4Int >>> 8) & 255,
      embeddedIpv4Int & 255,
    ].join(".");
    return isNonPublicIpv4(octets);
  }

  // 100::/64 (Discard prefix - RFC 6666)
  if (s0 === 0x0100 && s1 === 0 && s2 === 0 && s3 === 0) return true;

  // 2001:db8::/32 (Documentation - RFC 3849)
  if (s0 === 0x2001 && s1 === 0x0db8) return true;

  // 2002::/16 (6to4) - Embedded IPv4 in s1 and s2
  if (s0 === 0x2002) {
    const embeddedIpv4Int = ((s1 << 16) | s2) >>> 0;
    const octets = [
      (embeddedIpv4Int >>> 24) & 255,
      (embeddedIpv4Int >>> 16) & 255,
      (embeddedIpv4Int >>> 8) & 255,
      embeddedIpv4Int & 255,
    ].join(".");
    return isNonPublicIpv4(octets);
  }

  // fc00::/7 (Unique Local Address ULA - RFC 4193): first 7 bits are 0b1111110
  if ((s0 & 0xfe00) === 0xfc00) return true;

  // fe80::/10 (Link-Local Unicast - RFC 4291): first 10 bits are 0b1111111010
  if ((s0 & 0xffc0) === 0xfe80) return true;

  // ff00::/8 (Multicast - RFC 4291): first 8 bits are 0xff
  if ((s0 & 0xff00) === 0xff00) return true;

  return false;
}

/**
 * General check: returns true if the IP is an internal/non-public address.
 */
export function isNonPublicIp(ip: string): boolean {
  const clean = ip.replace(/^\[|\]$/g, "").trim();
  const family = net.isIP(clean);
  if (family === 4) return isNonPublicIpv4(clean);
  if (family === 6) return isNonPublicIpv6(clean);
  return true; // Unknown or unparseable IP -> unsafe
}

/**
 * Hostname validation: blocks obvious local/special names.
 */
export function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase().trim().replace(/^\[|\]$/g, "");
  if (
    lower === "localhost" ||
    lower === "127.0.0.1" ||
    lower === "0.0.0.0" ||
    lower === "::1" ||
    lower === "::" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower.endsWith(".internal") ||
    lower.endsWith(".lan") ||
    lower.endsWith(".home.arpa")
  ) {
    return true;
  }

  // If the hostname is already an IP literal, test it directly
  if (net.isIP(lower)) {
    return isNonPublicIp(lower);
  }

  return false;
}

export interface ValidatedTarget {
  url: URL;
  resolvedIp: string;
  ipFamily: 4 | 6;
}

/**
 * Allowed ports for external HTTP status checks.
 * Restricting to web service ports prevents arbitrary port-scanning SSRF (e.g. scanning internal databases on 5432, 6379, 27017, etc.)
 */
const ALLOWED_PORTS = new Set(["80", "443", "8080", "8443"]);

/**
 * Validates a target URL and resolves its DNS to guarantee no non-public IP is contacted.
 * Returns the validated URL and the pinned IP address to eliminate DNS-rebinding gaps.
 */
export async function validateAndResolveTarget(urlString: string): Promise<ValidatedTarget> {
  let parsed: URL;
  try {
    parsed = new URL(urlString.trim());
  } catch {
    throw new Error("Invalid URL format. Please provide a full URL including http:// or https://");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS protocols are supported.");
  }

  // Enforce port allowlist if a port is explicitly specified
  if (parsed.port && !ALLOWED_PORTS.has(parsed.port)) {
    throw new Error(`Port ${parsed.port} is not permitted for status checking. Permitted ports: 80, 443, 8080, 8443.`);
  }

  // Block forbidden hostnames
  if (isBlockedHostname(parsed.hostname)) {
    throw new Error("Requests to localhost, private domains, or local network addresses are blocked for security.");
  }

  // Resolve hostname via DNS to inspect all resolved addresses
  const hostToResolve = parsed.hostname.replace(/^\[|\]$/g, "");

  // If the host is already an IP literal
  const literalFamily = net.isIP(hostToResolve);
  if (literalFamily !== 0) {
    if (isNonPublicIp(hostToResolve)) {
      throw new Error("The specified IP address belongs to a private or restricted network range.");
    }
    return {
      url: parsed,
      resolvedIp: hostToResolve,
      ipFamily: literalFamily as 4 | 6,
    };
  }

  // Perform DNS resolution for all records
  let records: { address: string; family: number }[];
  try {
    records = await dns.lookup(hostToResolve, { all: true, verbatim: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "DNS resolution failed";
    throw new Error(`DNS resolution failed for host "${hostToResolve}": ${msg}`);
  }

  if (!records || records.length === 0) {
    throw new Error(`No DNS records found for host "${hostToResolve}".`);
  }

  // Verify that EVERY resolved address is safe (blocks multi-homed / rebinding addresses)
  for (const record of records) {
    if (isNonPublicIp(record.address)) {
      throw new Error(
        `Host "${hostToResolve}" resolved to a restricted IP address (${record.address}). Request blocked.`
      );
    }
  }

  // Prefer IPv4 for outbound connection if available, otherwise IPv6
  const chosen = records.find((r) => r.family === 4) || records[0];

  return {
    url: parsed,
    resolvedIp: chosen.address,
    ipFamily: chosen.family as 4 | 6,
  };
}
