/**
 * Knowledge base service — mock implementations for future Node.js backend integration.
 */

export async function fetchArticles() {
  // TODO: GET /api/kb
  throw new Error('fetchArticles: not implemented — using local state');
}

export async function fetchArticleById(id) {
  // TODO: GET /api/kb/:id
  throw new Error(`fetchArticleById(${id}): not implemented — using local state`);
}

export async function createArticle(payload) {
  // TODO: POST /api/kb
  // payload: { title, cat, content }
  throw new Error('createArticle: not implemented — using local state');
}
