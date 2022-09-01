// Plain JSON
export type JSONValue = string | number | boolean | null | JSONValue[] | {[key: string]: JSONValue};
export type JSONObject = {[key: string]: JSONValue};

interface URLParts {
  authority: string;
  fragment: string;
  path: string;
  query: string;
  scheme: string;
}

// RFC 3986
const URL_RE = /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;

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
 * AbortController exception class.
 */
export class AbortError extends Error {
  constructor(message = 'Aborted') {
    super(message);
    this.name = 'AbortError';
  }
}

/**
 * Capture STDOUT/STDERR output.
 */
export async function captureOutput(
  fn: () => Promise<void> | void,
  options: {stderr?: boolean; stdout?: boolean} = {}
): Promise<Buffer> {
  if (options.stdout === undefined) options.stdout = true;

  const output: any[] = [];
  const stdout = process.stdout;
  const stderr = process.stderr;
  const stdoutWrite = stdout.write;
  const stderrWrite = stderr.write;

  if (options.stdout === true) {
    stdout.write = (buffer: any) => {
      output.push(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
      return true;
    };
  }
  if (options.stderr === true) {
    stderr.write = (buffer: any) => {
      output.push(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
      return true;
    };
  }

  try {
    await fn();
  } finally {
    stdout.write = stdoutWrite;
    stderr.write = stderrWrite;
  }

  return Buffer.concat(output);
}

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
 * Decode URI component, but do not throw an exception if it fails.
 */
export function decodeURIComponentSafe(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch (error) {
    return null;
  }
}

/**
 * Escape string for use in a regular expression.
 */
export function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * JSON pointers.
 */
export function jsonPointer(value: JSONValue, pointer: string): JSONValue | undefined {
  if (pointer.startsWith('/') === false) return pointer.length > 0 ? null : value;

  let data: any = value;
  for (const part of pointer.replace(/^\//, '').split('/')) {
    const unescaped = part.replaceAll('~1', '/').replaceAll('~0', '~');

    if (typeof data === 'object' && data !== null && data[unescaped] !== undefined) {
      data = data[unescaped];
    } else if (Array.isArray(data) && /^\d+$/.test(unescaped) === true) {
      data = data[parseInt(unescaped)];
    } else {
      return undefined;
    }
  }

  return data;
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
 * Tablify data structure.
 */
export function tablify(rows: string[][] = []): string {
  const spec: number[] = [];

  const table = rows.map(row => {
    return row.map((col, i) => {
      col = `${col ?? ''}`.replace(/[\r\n]/g, '');
      if (col.length >= (spec[i] ?? 0)) spec[i] = col.length;
      return col;
    });
  });

  const lines = table.map(row => row.map((col, i) => (i === row.length - 1 ? col : col.padEnd(spec[i]))).join('  '));
  return lines.join('\n') + '\n';
}

/**
 * Escape all POSIX control characters except for `\n`.
 */
export function termEscape(value: string): string {
  return [...value]
    .map(char =>
      // eslint-disable-next-line no-control-regex
      /^[\x00-\x09\x0b-\x1f\x7f\x80-\x9f]$/.test(char) ? '\\x' + char.charCodeAt(0).toString(16).padStart(2, '0') : char
    )
    .join('');
}

/**
 * Split URL with the official regular expression.
 */
export function urlSplit(url: string): URLParts | null {
  const match = url.match(URL_RE);
  if (match === null) return null;

  return {
    scheme: match[2] ?? '',
    authority: match[4] ?? '',
    path: match[5] ?? '',
    query: match[7] ?? '',
    fragment: match[9] ?? ''
  };
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
