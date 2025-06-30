// frontend/src/utils/normalizeUrl.js (create this file)
export const normalizeUrl = (url) => {
    try {
      return url?.trim().replace(/\/+$/, ''); // remove trailing slashes
    } catch {
      return url;
    }
  };
  