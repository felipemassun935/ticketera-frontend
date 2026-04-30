export const PERMISSIONS = [
  { id: 'viewAllQueues',  label: 'Ver todas las bandejas'       },
  { id: 'manageTickets',  label: 'Gestionar tickets'            },
  { id: 'manageQueues',   label: 'Configurar bandejas'          },
  { id: 'manageUsers',    label: 'Gestionar usuarios'           },
  { id: 'manageRoles',    label: 'Gestionar roles'              },
  { id: 'viewReports',    label: 'Ver reportes'                 },
  { id: 'manageSLA',      label: 'Configurar SLA'               },
  { id: 'viewKB',         label: 'Ver base de conocimiento'     },
  { id: 'manageKB',       label: 'Editar base de conocimiento'  },
  { id: 'accessAdmin',    label: 'Acceder al panel admin'       },
];

export const INIT_ROLES = [
  {
    id: 'admin',
    label: 'Admin',
    description: 'Acceso total al sistema',
    color: '#CF7452',
    editable: false,
    permissions: {
      viewAllQueues: true,  manageTickets: true,  manageQueues: true,
      manageUsers:   true,  manageRoles:   true,  viewReports:  true,
      manageSLA:     true,  viewKB:        true,  manageKB:     true,
      accessAdmin:   true,
    },
  },
  {
    id: 'agent',
    label: 'Agente',
    description: 'Gestión de tickets asignados',
    color: '#5ca89a',
    editable: true,
    permissions: {
      viewAllQueues: true,  manageTickets: true,  manageQueues: false,
      manageUsers:   false, manageRoles:   false, viewReports:  true,
      manageSLA:     true,  viewKB:        true,  manageKB:     false,
      accessAdmin:   false,
    },
  },
  {
    id: 'customer',
    label: 'Cliente',
    description: 'Vista de tickets propios',
    color: '#6892b4',
    editable: true,
    permissions: {
      viewAllQueues: false, manageTickets: false, manageQueues: false,
      manageUsers:   false, manageRoles:   false, viewReports:  false,
      manageSLA:     false, viewKB:        true,  manageKB:     false,
      accessAdmin:   false,
    },
  },
];
