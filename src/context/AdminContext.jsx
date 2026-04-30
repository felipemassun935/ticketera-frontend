import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../services/api';

const AdminCtx = createContext(null);

export function AdminProvider({ children }) {
  const [queues, setQueues] = useState([]);
  const [users,  setUsers]  = useState([]);
  const [roles,  setRoles]  = useState([]);

  const loadAdmin = useCallback(async () => {
    const [qRes, rRes] = await Promise.all([
      api.get('/queues'),
      api.get('/roles'),
    ]);
    setQueues(qRes.queues);
    setRoles(rRes.roles);
    api.get('/users').then(r => setUsers(r.users)).catch(() => {});
  }, []);

  // ── Queues ────────────────────────────────────────────────────
  async function addQueue(q) {
    const { queue } = await api.post('/queues', { id: q.id, name: q.name, owner_name: q.owner_name, color: q.color });
    setQueues(qs => [...qs, queue]);
  }
  async function updateQueue(q) {
    const { queue } = await api.patch(`/queues/${q.id}`, { name: q.name, owner_name: q.owner_name, color: q.color });
    setQueues(qs => qs.map(x => x.id === q.id ? queue : x));
  }
  async function removeQueue(id) {
    await api.del(`/queues/${id}`);
    setQueues(qs => qs.filter(x => x.id !== id));
  }
  async function toggleQueue(id) {
    const { queue } = await api.patch(`/queues/${id}/toggle`);
    setQueues(qs => qs.map(x => x.id === id ? queue : x));
  }

  // ── Users ──────────────────────────────────────────────────────
  async function addUser(u) {
    const { user } = await api.post('/users', { name: u.name, email: u.email, password: u.password, role: u.role_id ?? u.role ?? 'agent' });
    setUsers(us => [...us, user]);
  }
  async function updateUser(u) {
    const { user } = await api.patch(`/users/${u.id}`, { name: u.name, email: u.email, role: u.role_id ?? u.role, ...(u.password && { password: u.password }) });
    setUsers(us => us.map(x => x.id === u.id ? user : x));
  }
  async function removeUser(id) {
    await api.del(`/users/${id}`);
    setUsers(us => us.filter(x => x.id !== id));
  }
  async function toggleUser(id) {
    const { user } = await api.patch(`/users/${id}/toggle`);
    setUsers(us => us.map(x => x.id === id ? user : x));
  }

  // ── Roles ──────────────────────────────────────────────────────
  async function addRole(r) {
    const { role } = await api.post('/roles', { id: r.id, label: r.label, description: r.description, color: r.color, permissions: r.permissions });
    setRoles(rs => [...rs, role]);
  }
  async function updateRole(r) {
    const { role } = await api.patch(`/roles/${r.id}`, { label: r.label, description: r.description, color: r.color, permissions: r.permissions });
    setRoles(rs => rs.map(x => x.id === r.id ? role : x));
  }
  async function removeRole(id) {
    await api.del(`/roles/${id}`);
    setRoles(rs => rs.filter(x => x.id !== id));
  }

  return (
    <AdminCtx.Provider value={{
      queues, addQueue, updateQueue, removeQueue, toggleQueue,
      users,  addUser,  updateUser,  removeUser,  toggleUser,
      roles,  addRole,  updateRole,  removeRole,
      loadAdmin,
    }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() { return useContext(AdminCtx); }
