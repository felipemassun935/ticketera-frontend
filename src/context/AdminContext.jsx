import { createContext, useContext, useState } from 'react';
import { QUEUES } from '../constants';
import { INIT_USERS } from '../constants/users';
import { INIT_ROLES } from '../constants/roles';

// Enrich queues with an `active` flag and stable numeric id
const INIT_QUEUES = QUEUES.map((q, i) => ({ ...q, active: true, _id: i + 1 }));

let _userId  = INIT_USERS.length + 1;
let _queueId = INIT_QUEUES.length + 1;
let _roleId  = INIT_ROLES.length + 1;

const AdminCtx = createContext(null);

export function AdminProvider({ children }) {
  const [queues, setQueues] = useState(INIT_QUEUES);
  const [users,  setUsers]  = useState(INIT_USERS);
  const [roles,  setRoles]  = useState(INIT_ROLES);

  // ── Queues ──────────────────────────────────────────────────
  function addQueue(q)    { setQueues(qs => [...qs, { ...q, _id: ++_queueId, active: true }]); }
  function updateQueue(q) { setQueues(qs => qs.map(x => x._id === q._id ? q : x)); }
  function removeQueue(id){ setQueues(qs => qs.filter(x => x._id !== id)); }
  function toggleQueue(id){ setQueues(qs => qs.map(x => x._id === id ? { ...x, active: !x.active } : x)); }

  // ── Users ────────────────────────────────────────────────────
  function addUser(u)    { setUsers(us => [...us, { ...u, id: ++_userId, active: true }]); }
  function updateUser(u) { setUsers(us => us.map(x => x.id === u.id ? u : x)); }
  function removeUser(id){ setUsers(us => us.filter(x => x.id !== id)); }
  function toggleUser(id){ setUsers(us => us.map(x => x.id === id ? { ...x, active: !x.active } : x)); }

  // ── Roles ────────────────────────────────────────────────────
  function addRole(r)    { setRoles(rs => [...rs, { ...r, id: `role_${++_roleId}`, editable: true }]); }
  function updateRole(r) { setRoles(rs => rs.map(x => x.id === r.id ? r : x)); }
  function removeRole(id){ setRoles(rs => rs.filter(x => x.id !== id)); }

  return (
    <AdminCtx.Provider value={{
      queues, addQueue, updateQueue, removeQueue, toggleQueue,
      users,  addUser,  updateUser,  removeUser,  toggleUser,
      roles,  addRole,  updateRole,  removeRole,
    }}>
      {children}
    </AdminCtx.Provider>
  );
}

export function useAdmin() { return useContext(AdminCtx); }
