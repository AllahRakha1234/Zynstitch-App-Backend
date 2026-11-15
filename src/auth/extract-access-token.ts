import type { IncomingHttpHeaders } from 'node:http';

export function readCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = part.slice(0, separator).trim();
    if (key !== name) {
      continue;
    }
    return decodeURIComponent(part.slice(separator + 1).trim());
  }

  return null;
}

export function extractBearerToken(
  headers: IncomingHttpHeaders,
): string | null {
  const header = headers.authorization;
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }
  return token;
}

export function extractAccessToken(
  headers: IncomingHttpHeaders,
  cookieName: string,
): string | null {
  return (
    readCookieValue(headers.cookie, cookieName) ?? extractBearerToken(headers)
  );
}
