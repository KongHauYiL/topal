export const VALID_TLDS = [
  '.topal',
  '.magic',
  '.aura',
];

export function isValidTLD(tld: string): boolean {
  if (VALID_TLDS.includes(tld)) return true;

  if (tld.length === 3 && tld.startsWith('.') && /^[a-z]{2}$/.test(tld.substring(1))) {
    return true;
  }

  return false;
}

export function extractDomainAndTLD(fullUrl: string): { domain: string; tld: string } | null {
  const lowerUrl = fullUrl.toLowerCase().trim();

  for (const tld of VALID_TLDS) {
    if (lowerUrl.endsWith(tld)) {
      const domain = lowerUrl.substring(0, lowerUrl.length - tld.length);
      return { domain, tld };
    }
  }

  const parts = lowerUrl.split('.');
  if (parts.length === 2 && parts[1].length === 2 && /^[a-z]+$/.test(parts[1])) {
    return { domain: parts[0], tld: `.${parts[1]}` };
  }

  return null;
}

export function validateDomain(domain: string): { valid: boolean; error?: string } {
  if (!domain || domain.length === 0) {
    return { valid: false, error: 'Domain is required' };
  }

  if (!/^[a-z]+$/.test(domain)) {
    return { valid: false, error: 'Domain can only contain letters (a-z)' };
  }

  return { valid: true };
}
