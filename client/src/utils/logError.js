// Safe client-side error logging.
//
// `console.error('Error fetching x:', error)` on an Axios error is a leak: the
// rejection carries `error.config.headers.Authorization` (the bearer token) and
// `error.config.data` (the whole request body — passwords on a login failure,
// the contact form on a submit failure). Anything with access to the page can
// read the console, so log a fixed summary instead of the error object.
//
// What we keep: our own label, the HTTP status, and the server's message — the
// API only ever returns fixed strings or already-redacted text.
const logError = (context, error) => {
  const status = error?.response?.status;
  const detail =
    error?.response?.data?.message || error?.message || 'unknown error';

  console.error(`[${context}]${status ? ` ${status}` : ''}: ${detail}`);
};

export default logError;
