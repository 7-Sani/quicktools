/**
 * IPv4, CIDR, and Network utilities for QuickTools.
 * Pure mathematical, client-side, zero external dependencies.
 */

export function isValidIPv4(ip: string): boolean {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    // Disallow leading zeros unless the octet is strictly '0'
    if (part.length > 1 && part.startsWith("0")) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
  }
  return true;
}

export function ipToInt(ip: string): number {
  return ip
    .trim()
    .split(".")
    .reduce((acc, octet) => ((acc << 8) + parseInt(octet, 10)) >>> 0, 0);
}

export function intToIp(int: number): string {
  const uInt = int >>> 0;
  return [
    (uInt >>> 24) & 255,
    (uInt >>> 16) & 255,
    (uInt >>> 8) & 255,
    uInt & 255,
  ].join(".");
}

export function cidrToMaskInt(cidr: number): number {
  if (cidr <= 0) return 0;
  if (cidr >= 32) return 0xffffffff >>> 0;
  return (~0 << (32 - cidr)) >>> 0;
}

export function maskIntToCidr(maskInt: number): number {
  let count = 0;
  let val = maskInt >>> 0;
  while (val & 0x80000000) {
    count++;
    val = (val << 1) >>> 0;
  }
  return count;
}

export function intToBinary(int: number): string {
  const uInt = int >>> 0;
  const binary32 = uInt.toString(2).padStart(32, "0");
  return `${binary32.slice(0, 8)}.${binary32.slice(8, 16)}.${binary32.slice(16, 24)}.${binary32.slice(24, 32)}`;
}

export function intToHex(int: number): string {
  return "0x" + (int >>> 0).toString(16).toUpperCase().padStart(8, "0");
}

export interface SubnetResult {
  ip: string;
  cidr: number;
  netmask: string;
  wildcard: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableIp: string;
  lastUsableIp: string;
  totalAddresses: number;
  usableHosts: number;
  ipBinary: string;
  netmaskBinary: string;
  networkBinary: string;
  broadcastBinary: string;
  ipClass: "A" | "B" | "C" | "D" | "E";
  scope: string;
  isPrivate: boolean;
}

export function calculateSubnet(ipStr: string, cidr: number): SubnetResult | null {
  if (!isValidIPv4(ipStr) || cidr < 0 || cidr > 32) return null;

  const ipIntVal = ipToInt(ipStr);
  const maskIntVal = cidrToMaskInt(cidr);
  const wildcardIntVal = (~maskIntVal) >>> 0;
  const networkIntVal = (ipIntVal & maskIntVal) >>> 0;
  const broadcastIntVal = (networkIntVal | wildcardIntVal) >>> 0;

  const totalAddresses = Math.pow(2, 32 - cidr);
  let usableHosts = 0;
  let firstUsableInt = networkIntVal;
  let lastUsableInt = broadcastIntVal;

  if (cidr === 32) {
    usableHosts = 1;
    firstUsableInt = ipIntVal;
    lastUsableInt = ipIntVal;
  } else if (cidr === 31) {
    // RFC 3021 Point-to-Point Links
    usableHosts = 2;
    firstUsableInt = networkIntVal;
    lastUsableInt = broadcastIntVal;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableInt = (networkIntVal + 1) >>> 0;
    lastUsableInt = (broadcastIntVal - 1) >>> 0;
  }

  // Classful classification (historical)
  const firstOctet = (ipIntVal >>> 24) & 255;
  let ipClass: "A" | "B" | "C" | "D" | "E" = "A";
  if (firstOctet >= 240) ipClass = "E";
  else if (firstOctet >= 224) ipClass = "D";
  else if (firstOctet >= 192) ipClass = "C";
  else if (firstOctet >= 128) ipClass = "B";

  const classification = getIpClassification(ipStr);

  return {
    ip: ipStr,
    cidr,
    netmask: intToIp(maskIntVal),
    wildcard: intToIp(wildcardIntVal),
    networkAddress: intToIp(networkIntVal),
    broadcastAddress: intToIp(broadcastIntVal),
    firstUsableIp: intToIp(firstUsableInt),
    lastUsableIp: intToIp(lastUsableInt),
    totalAddresses,
    usableHosts,
    ipBinary: intToBinary(ipIntVal),
    netmaskBinary: intToBinary(maskIntVal),
    networkBinary: intToBinary(networkIntVal),
    broadcastBinary: intToBinary(broadcastIntVal),
    ipClass,
    scope: classification.scope,
    isPrivate: classification.isPrivate,
  };
}

export function getIpClassification(ip: string): {
  scope: string;
  isPrivate: boolean;
  type: string;
} {
  if (!isValidIPv4(ip)) return { scope: "Invalid", isPrivate: false, type: "Unknown" };

  const int = ipToInt(ip);
  const octet1 = (int >>> 24) & 255;
  const octet2 = (int >>> 16) & 255;

  if (octet1 === 10) {
    return { scope: "Private (RFC 1918 - Class A)", isPrivate: true, type: "Local Intranet" };
  }
  if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) {
    return { scope: "Private (RFC 1918 - Class B)", isPrivate: true, type: "Local Intranet" };
  }
  if (octet1 === 192 && octet2 === 168) {
    return { scope: "Private (RFC 1918 - Class C)", isPrivate: true, type: "Home / Office LAN" };
  }
  if (octet1 === 127) {
    return { scope: "Loopback (localhost)", isPrivate: true, type: "Host Local" };
  }
  if (octet1 === 169 && octet2 === 254) {
    return { scope: "Link-Local (APIPA / RFC 3927)", isPrivate: true, type: "Auto-Configuration" };
  }
  if (octet1 === 100 && octet2 >= 64 && octet2 <= 127) {
    return { scope: "Carrier-Grade NAT (RFC 6598)", isPrivate: true, type: "ISP Shared Network" };
  }
  if (octet1 >= 224 && octet1 <= 239) {
    return { scope: "Multicast (Class D - RFC 5771)", isPrivate: false, type: "Multicast Group" };
  }
  if (octet1 >= 240) {
    return { scope: "Reserved for Future Use (Class E)", isPrivate: false, type: "Experimental" };
  }
  if (ip === "0.0.0.0" || ip === "255.255.255.255") {
    return { scope: "Special / Broadcast", isPrivate: false, type: "Special Network" };
  }

  return { scope: "Public (Globally Routable)", isPrivate: false, type: "Public Internet" };
}

export function validateMacAddress(mac: string): {
  isValid: boolean;
  standardColon: string;
  standardHyphen: string;
  ciscoFormat: string;
  rawHex: string;
  isMulticast: boolean;
  isLocallyAdministered: boolean;
} | null {
  const cleanHex = mac.trim().replace(/[^a-fA-F0-9]/g, "");

  if (cleanHex.length !== 12 && cleanHex.length !== 16) {
    return null;
  }

  // Format as standard pairs
  const pairs: string[] = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    pairs.push(cleanHex.slice(i, i + 2).toUpperCase());
  }

  const standardColon = pairs.join(":");
  const standardHyphen = pairs.join("-");

  // Cisco format: 4 groups of 4 characters
  const quads: string[] = [];
  for (let i = 0; i < cleanHex.length; i += 4) {
    quads.push(cleanHex.slice(i, i + 4).toLowerCase());
  }
  const ciscoFormat = quads.join(".");

  // 1st octet analysis
  const firstByte = parseInt(cleanHex.slice(0, 2), 16);
  const isMulticast = (firstByte & 0x01) === 1;
  const isLocallyAdministered = (firstByte & 0x02) === 2;

  return {
    isValid: true,
    standardColon,
    standardHyphen,
    ciscoFormat,
    rawHex: cleanHex.toUpperCase(),
    isMulticast,
    isLocallyAdministered,
  };
}
