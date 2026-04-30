import { useState } from 'react';
import { QUEUES } from './constants';
import { INIT_TICKETS } from './constants/tickets';
import { C } from './styles/tokens';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminProvider } from './context/AdminContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import LoginView from './pages/LoginView';
import InboxView from './pages/InboxView';
import TicketDetail from './pages/TicketDetail';
import CreateView from './pages/CreateView';
import KBView from './pages/KBView';
import SLAView from './pages/SLAView';
import ReportsView from './pages/ReportsView';
import QueuesAdmin from './pages/admin/QueuesAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';
import RolesAdmin from './pages/admin/RolesAdmin';

const INBOX_IDS = ['all', 'mine', 'unassigned', ...QUEUES.map((q) => `q_${q.id}`)];

const VIEW_TITLES = {
  all:          'Todas las bandejas',
  mine:         'Mis tickets',
  unassigned:   'Sin asignar',
  create:       'Nuevo ticket',
  kb:           'Conocimiento',
  sla:          'SLA / Reglas',
  reports:      'Reportes',
  admin_queues: 'Administración · Bandejas',
  admin_users:  'Administración · Usuarios',
  admin_roles:  'Administración · Roles',
};

function AppInner() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [tickets,  setTickets]  = useState(INIT_TICKETS);
  const [active,   setActive]   = useState('all');
  const [selected, setSelected] = useState(null);

  if (!user) return <LoginView />;

  const role    = user.role;
  const isAdmin = role === 'admin';

  function handleUpdate(t) {
    setTickets((ts) => ts.map((x) => (x.id === t.id ? t : x)));
    setSelected(t);
  }

  function handleSidebar(id) {
    setActive(id);
    setSelected(null);
  }

  const qActive = QUEUES.find((q) => `q_${q.id}` === active);
  const title   = selected ? selected.id : (qActive ? qActive.name : VIEW_TITLES[active] || '');
  const isInbox = INBOX_IDS.includes(active);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: C.bg0 }}>
      <Sidebar active={active} setActive={handleSidebar} tickets={tickets} role={role} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar
          user={user}
          title={title}
          theme={theme}
          toggleTheme={toggleTheme}
          onLogout={logout}
        />

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Ticket detail */}
          {selected && (
            <TicketDetail ticket={selected} onBack={() => setSelected(null)} role={role} onUpdate={handleUpdate} />
          )}

          {/* Inbox views */}
          {!selected && isInbox && (
            <InboxView tickets={tickets} onSelect={setSelected} role={role} active={active} />
          )}

          {/* Tool views */}
          {!selected && active === 'create'  && <CreateView role={role} />}
          {!selected && active === 'kb'      && <KBView role={role} />}
          {!selected && active === 'sla'     && role !== 'customer' && <SLAView />}
          {!selected && active === 'reports' && role !== 'customer' && <ReportsView />}

          {/* Admin views — only accessible to admins */}
          {!selected && active === 'admin_queues' && isAdmin && <QueuesAdmin />}
          {!selected && active === 'admin_users'  && isAdmin && <UsersAdmin />}
          {!selected && active === 'admin_roles'  && isAdmin && <RolesAdmin />}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ThemeProvider>
          <AppInner />
        </ThemeProvider>
      </AdminProvider>
    </AuthProvider>
  );
}
