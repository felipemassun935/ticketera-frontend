/**
 * Ticket service — mock implementations for future Node.js backend integration.
 * Replace these functions with real API calls when the backend is ready.
 * Base URL should be configured via environment variable: import.meta.env.VITE_API_URL
 */

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchTickets() {
  // TODO: GET /api/tickets
  throw new Error('fetchTickets: not implemented — using local state');
}

export async function fetchTicketById(id) {
  // TODO: GET /api/tickets/:id
  throw new Error(`fetchTicketById(${id}): not implemented — using local state`);
}

export async function createTicket(payload) {
  // TODO: POST /api/tickets
  // payload: { title, queue, category, priority, desc, tags }
  throw new Error('createTicket: not implemented — using local state');
}

export async function updateTicket(id, payload) {
  // TODO: PATCH /api/tickets/:id
  // payload: { status, comment, category, agent }
  throw new Error(`updateTicket(${id}): not implemented — using local state`);
}

export async function moveTicketQueue(id, targetQueueId, note, agent) {
  // TODO: POST /api/tickets/:id/move
  // payload: { targetQueueId, note, agent }
  throw new Error(`moveTicketQueue(${id}): not implemented — using local state`);
}
