// Normalize a user-entered URL into an absolute one safe for an `href`.
//
// The admin can save a social/project link as a bare domain, e.g.
// `github.com/wakil-roomi-091`. A scheme-less value in an <a href> is treated
// by the browser as a RELATIVE path, so it resolves against the current page
// (http://localhost:5173/github.com/...) and lands on a blank route instead of
// the real site. Prepend https:// when no scheme is present so the link is
// always absolute.
//
// Left untouched: empty values (so `link && <a>` guards still work) and values
// that already carry a scheme — https:, http:, mailto:, tel:, and protocol-
// relative //host URLs.
const toExternalUrl = (url) => {
  if (!url) return url;

  const trimmed = url.trim();
  // Already absolute (has a scheme like https:/mailto:) or protocol-relative.
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('//')) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export default toExternalUrl;
