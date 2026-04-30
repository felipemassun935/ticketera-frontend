/**
 * SLA service — mock implementations for future Node.js backend integration.
 */

export async function fetchSlaRules() {
  // TODO: GET /api/sla-rules
  throw new Error('fetchSlaRules: not implemented — using local state');
}

export async function toggleSlaRule(id, enabled) {
  // TODO: PATCH /api/sla-rules/:id
  // payload: { enabled }
  throw new Error(`toggleSlaRule(${id}): not implemented — using local state`);
}

export async function createSlaRule(payload) {
  // TODO: POST /api/sla-rules
  throw new Error('createSlaRule: not implemented — using local state');
}
