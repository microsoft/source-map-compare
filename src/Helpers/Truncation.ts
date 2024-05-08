import inspector from 'inspector';

const isDebug = !!inspector.url;

interface TailTruncateString {
  value: string;
  weight: number;
}

function tail(value: string, weight: number = 1): TailTruncateString {
  return { value, weight };
}

function truncateString(strings: TemplateStringsArray, ...expr: (string | TailTruncateString | undefined)[]): string {
  // adjust for debug output including logging level (e.g. 'verbose: ')
  const maxChars = (process.stdout.columns ?? 80) - (isDebug ? 10 : 0);
  let numToTruncate = 0;
  const lengthBeforeTruncatedStrings = expr
    .map(token =>
      token === undefined ? 'undefined' : typeof token === 'string' ? token : ((numToTruncate += token.weight), '')
    )
    .concat(strings)
    .join('').length;

  let charsRemaining = Math.max(0, maxChars - lengthBeforeTruncatedStrings);
  function truncateToken({ value, weight }: TailTruncateString) {
    if (charsRemaining <= 0) return '';
    const distributedChars = charsRemaining / numToTruncate;
    numToTruncate -= weight;
    let truncatedToken = value.substr(-distributedChars);
    if (truncatedToken.length < value.length) {
      truncatedToken = `...${truncatedToken.substring(3)}`.substring(0, distributedChars);
    }
    charsRemaining -= truncatedToken.length;
    return truncatedToken;
  }

  const tokens = expr.map(token =>
    token === undefined ? 'undefined' : typeof token === 'string' ? token : truncateToken(token)
  );
  return String.raw(strings, ...tokens).substring(0, maxChars);
}

interface TruncateTemplate {
  (strings: TemplateStringsArray, ...expr: (string | TailTruncateString | undefined)[]): string;
  tail(value: string, weight?: number): TailTruncateString;
}

export const truncate: TruncateTemplate = Object.assign(truncateString, { tail });
