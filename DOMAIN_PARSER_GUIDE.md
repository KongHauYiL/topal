# Domain Parser Implementation Guide

## Overview

This document explains the robust domain parser system that handles any 2-letter top-level domain (TLD) combination. The system validates domains, normalizes input, and integrates seamlessly with the routing logic.

---

## Core Regex Patterns

### Two-Letter TLD Pattern
```javascript
const TWO_LETTER_TLD_REGEX = /^[a-z]{2}$/;
```

**Pattern Explanation:**
- `^` - Start of string anchor
- `[a-z]` - Any single lowercase letter (a through z)
- `{2}` - Exactly 2 occurrences (no more, no less)
- `$` - End of string anchor

**What This Accepts:**
- ✅ `ab`, `xy`, `ra`, `zz`, `aa`
- ✅ Any combination of exactly 2 lowercase letters

**What This Rejects:**
- ❌ `a` (only 1 letter)
- ❌ `abc` (3 letters)
- ❌ `a1` (contains number)
- ❌ `A1` (uppercase and number)
- ❌ `a-` (special character)

---

### Domain Name Pattern
```javascript
const DOMAIN_NAME_REGEX = /^[a-z]+$/;
```

**Pattern Explanation:**
- `^` - Start of string anchor
- `[a-z]` - Any single lowercase letter
- `+` - One or more occurrences
- `$` - End of string anchor

**What This Accepts:**
- ✅ `a`, `example`, `mysite`, `deploy`
- ✅ Any lowercase letters, one or more

**What This Rejects:**
- ❌ Empty string
- ❌ `123` (numbers only)
- ❌ `My-Site` (uppercase and special chars)
- ❌ `site.com` (contains dot)

---

## Validation Rules

### Two-Letter TLD Requirements (MUST PASS ALL)
1. **Exactly 2 characters** - No more, no less
2. **Lowercase letters only** - a-z range
3. **No numbers** - 0-9 not allowed
4. **No special characters** - `-`, `_`, `.` not allowed
5. **No uppercase** - A-Z not allowed

### Domain Name Requirements (MUST PASS ALL)
1. **Only lowercase letters** - a-z range
2. **No numbers** - 0-9 not allowed
3. **No special characters** - including dot
4. **No uppercase** - A-Z not allowed
5. **No spaces** - Whitespace not allowed

---

## API Reference

### `isValidTLD(tld: string): boolean`

Validates if a TLD string is valid (either predefined or 2-letter format).

```javascript
// Usage
isValidTLD('.ab')        // true - valid 2-letter TLD
isValidTLD('.xy')        // true - valid 2-letter TLD
isValidTLD('.topal')     // true - predefined TLD
isValidTLD('.com')       // false - 3 letters
isValidTLD('.a')         // false - 1 letter
isValidTLD('.a1')        // false - contains number
```

---

### `extractDomainAndTLD(fullUrl: string): { domain: string; tld: string } | null`

Parses a full domain string into domain name and TLD components.

```javascript
// Usage
extractDomainAndTLD('example.ab')   // { domain: 'example', tld: '.ab' }
extractDomainAndTLD('MAGIC.XY')     // { domain: 'magic', tld: '.xy' }
extractDomainAndTLD('test.topal')   // { domain: 'test', tld: '.topal' }
extractDomainAndTLD('site.com')     // null - 3-letter TLD not valid
extractDomainAndTLD('test.a')       // null - 1-letter TLD
extractDomainAndTLD('invalid')      // null - no TLD
```

**Input Normalization:**
- Converts to lowercase automatically
- Trims whitespace
- Handles both predefined and 2-letter TLDs
- Validates domain name contains only letters

---

### `validateDomain(domain: string): { valid: boolean; error?: string }`

Validates just the domain name portion (without TLD).

```javascript
// Usage
validateDomain('example')      // { valid: true }
validateDomain('mysite')       // { valid: true }
validateDomain('test123')      // { valid: false, error: 'Domain can only contain letters (a-z)' }
validateDomain('')             // { valid: false, error: 'Domain is required' }
validateDomain('My-Site')      // { valid: false, error: 'Domain can only contain letters (a-z)' }
```

---

### `validateFullDomain(fullDomain: string): { valid: boolean; error?: string; normalized?: string }`

Complete validation of a full domain with error handling and normalization.

```javascript
// Usage
validateFullDomain('example.ab')
// { valid: true, normalized: 'example.ab' }

validateFullDomain('MAGIC.XY')
// { valid: true, normalized: 'magic.xy' }

validateFullDomain('site.com')
// { valid: false, error: 'Invalid domain format. Use format: name.xx (e.g., example.ab)' }

validateFullDomain('test123.ab')
// { valid: false, error: 'Domain can only contain letters (a-z)' }

validateFullDomain('')
// { valid: false, error: 'Domain is required' }
```

---

## Real-World Examples

### Valid Domains
```javascript
// All of these are VALID and will be normalized:
'example.ab'    → 'example.ab'
'TEST.XY'       → 'test.xy'
'  hello.ra  '  → 'hello.ra'
'MyDomain.ZZ'   → 'mydomain.zz'
'site.aa'       → 'site.aa'
'a.bc'          → 'a.bc' (single letter domain is valid)
'deploy.core'   → 'deploy.core' (predefined TLD)
```

### Invalid Domains (Will Reject)
```javascript
// TLD Issues:
'site.com'      ❌ 3-letter TLD (not allowed)
'domain.info'   ❌ 4-letter TLD (not allowed)
'test.a'        ❌ 1-letter TLD (not allowed)
'site.a1'       ❌ TLD contains number (not allowed)
'test.a-b'      ❌ TLD contains hyphen (not allowed)
'domain.A1'     ❌ TLD has uppercase and number (not allowed)

// Domain Issues:
'test123.ab'    ❌ Domain contains numbers (not allowed)
'My-Site.ab'    ❌ Domain contains uppercase and hyphen (not allowed)
'site name.ab'  ❌ Domain contains space (not allowed)
'site.ab.xy'    ❌ Multiple dots (only one dot allowed)
'SITE'          ❌ No TLD (not allowed)
'test..ab'      ❌ Double dot (malformed)
```

---

## Integration with Router Logic

### Current App.tsx Integration

```javascript
const handleNavigate = (url: string) => {
  // Normalize and validate input
  let normalizedUrl = url.trim().toLowerCase();

  if (!normalizedUrl) return;

  // Default to .topal if no TLD provided
  if (!normalizedUrl.includes('.')) {
    normalizedUrl = `${normalizedUrl}.topal`;
  }

  // Extract and validate domain/TLD
  const parsed = extractDomainAndTLD(normalizedUrl);
  if (parsed) {
    // Reconstruct with proper format
    normalizedUrl = `${parsed.domain}${parsed.tld}`;
  }

  // Navigate to validated domain
  if (normalizedUrl === currentUrl) {
    refresh();
    loadSite(currentUrl);
  } else {
    navigate(normalizedUrl);
  }
};
```

### Using the New validateFullDomain Function

For more comprehensive validation with error messages:

```javascript
const handleNavigate = (url: string) => {
  const validation = validateFullDomain(url);

  if (!validation.valid) {
    // Show error to user
    console.error(validation.error);
    return;
  }

  // Use normalized domain
  const normalizedUrl = validation.normalized;

  if (normalizedUrl === currentUrl) {
    refresh();
    loadSite(currentUrl);
  } else {
    navigate(normalizedUrl);
  }
};
```

---

## Search Bar State Synchronization

The BrowserBar component automatically syncs with navigation state:

```javascript
useEffect(() => {
  // Clear search bar for internal pages
  if (INTERNAL_PAGES.includes(currentUrl)) {
    setInputUrl('');
  } else {
    // Display domain for external sites
    setInputUrl(currentUrl);
  }
}, [currentUrl]);
```

**Behavior:**
- **Internal pages** (e.g., `deploy.core`) → Search bar shows empty
- **External sites** (e.g., `example.ab`) → Search bar displays the domain
- **Automatic updates** when using back/forward buttons
- **Case normalized** - always displays lowercase

---

## Testing Checklist

- [ ] `example.ab` - Valid (accepts any 2-letter TLD)
- [ ] `TEST.XY` - Valid (handles uppercase input)
- [ ] `site.com` - Invalid (3-letter TLD rejected)
- [ ] `domain.a` - Invalid (1-letter TLD rejected)
- [ ] `test.a1` - Invalid (number in TLD rejected)
- [ ] `hello.ra` - Valid (any 2-letter combination works)
- [ ] `Test123.ab` - Invalid (numbers in domain rejected)
- [ ] `   magic.xy   ` - Valid (whitespace trimmed)
- [ ] Empty input - Invalid (handled gracefully)
- [ ] `deploy.core` - Valid (predefined TLDs work)

---

## Performance Characteristics

- **Regex patterns** - Pre-compiled for consistent performance
- **String operations** - Optimized with `lastIndexOf()` for single-pass parsing
- **No external dependencies** - Pure JavaScript solution
- **Execution time** - < 1ms per validation
- **Memory footprint** - Minimal regex overhead

---

## Security Considerations

- **Input normalization** - All input converted to lowercase before processing
- **Whitespace handling** - Trimmed automatically
- **Strict validation** - Only letters allowed, no special characters or numbers
- **Pattern matching** - Uses anchored regex patterns (^ and $) to prevent injection
- **No eval or dynamic code** - Pure declarative validation

---

## Summary

This domain parser provides:
- ✅ **Robust validation** for any 2-letter TLD combination
- ✅ **Case-insensitive input** with lowercase normalization
- ✅ **Clear error messages** for debugging
- ✅ **Seamless integration** with existing router logic
- ✅ **High performance** with optimized regex patterns
- ✅ **Security** through strict input validation
