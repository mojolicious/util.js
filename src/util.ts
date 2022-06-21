const XML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

const XML_UNESCAPE: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'"
};

/**
 * Safe string that should not be escaped.
 */
export class SafeString extends String {}

/**
 * CSS unescape string.
 */
export function cssUnescape(value: string): string {
  return value.replaceAll('\\n', '').replace(/\\([0-9a-fA-F]{1,6})\s?/g, cssUnescapeReplace);
}

function cssUnescapeReplace(value: string): string {
  return String.fromCharCode(parseInt(value.replaceAll('\\', ''), 16));
}

/**
 * Escape string for use in a regular expression.
 */
export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Helper function for sticky regex matching.
 */
export function stickyMatch(
  stringWithOffset: {offset: number; value: string},
  stickyRegex: RegExp
): RegExpMatchArray | null {
  stickyRegex.lastIndex = stringWithOffset.offset;
  const match = stickyRegex.exec(stringWithOffset.value);
  if (match !== null) stringWithOffset.offset = stickyRegex.lastIndex;
  return match;
}

/**
 * XML escape string, but exclude `SafeString` objects.
 */
export function xmlEscape(value: string | SafeString): string {
  if (value instanceof SafeString) return value.toString();
  if (typeof value !== 'string') value = `${value}`;
  return ('' + value).replace(/[&<>'"]/g, xmlEscapeReplace);
}
function xmlEscapeReplace(char: string): string {
  return XML_ESCAPE[char];
}

/**
 * XML unescape string.
 */
export function xmlUnescape(value: string): string {
  return value.replace(/&(amp|lt|gt|quot|apos|#39);/g, xmlUnescapeReplace);
}

function xmlUnescapeReplace(value: string, entity: string): string {
  return XML_UNESCAPE[entity];
}
