export const VALID_TLDS = [
  '.topal',
  '.magic',
  '.aura',
];

const TWO_LETTER_TLD_REGEX = /^[a-z]{2}$/;
const DOMAIN_NAME_REGEX = /^[a-z]+$/;

export function isValidTLD(tld: string): boolean {
  if (VALID_TLDS.includes(tld)) return true;

  if (tld.startsWith('.')) {
    const tldContent = tld.substring(1);
    return TWO_LETTER_TLD_REGEX.test(tldContent);
  }

  return false;
}

export function extractDomainAndTLD(fullUrl: string): { domain: string; tld: string } | null {
  const lowerUrl = fullUrl.toLowerCase().trim();

  for (const tld of VALID_TLDS) {
    if (lowerUrl.endsWith(tld)) {
      const domain = lowerUrl.substring(0, lowerUrl.length - tld.length);
      if (DOMAIN_NAME_REGEX.test(domain)) {
        return { domain, tld };
      }
    }
  }

  const lastDotIndex = lowerUrl.lastIndexOf('.');
  if (lastDotIndex > 0 && lastDotIndex < lowerUrl.length - 1) {
    const domain = lowerUrl.substring(0, lastDotIndex);
    const tldPart = lowerUrl.substring(lastDotIndex + 1);

    if (DOMAIN_NAME_REGEX.test(domain) && TWO_LETTER_TLD_REGEX.test(tldPart)) {
      return { domain, tld: `.${tldPart}` };
    }
  }

  return null;
}

export function validateDomain(domain: string): { valid: boolean; error?: string } {
  if (!domain || domain.length === 0) {
    return { valid: false, error: 'Domain is required' };
  }

  if (!DOMAIN_NAME_REGEX.test(domain)) {
    return { valid: false, error: 'Domain can only contain letters (a-z)' };
  }

  return { valid: true };
}

export function validateFullDomain(fullDomain: string): { valid: boolean; error?: string; normalized?: string } {
  if (!fullDomain || fullDomain.length === 0) {
    return { valid: false, error: 'Domain is required' };
  }

  const normalized = fullDomain.toLowerCase().trim();
  const parsed = extractDomainAndTLD(normalized);

  if (!parsed) {
    return { valid: false, error: 'Invalid domain format. Use format: name.xx (e.g., example.ab)' };
  }

  const domainValidation = validateDomain(parsed.domain);
  if (!domainValidation.valid) {
    return { valid: false, error: domainValidation.error };
  }

  return { valid: true, normalized: `${parsed.domain}${parsed.tld}` };
}
