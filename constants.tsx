
import { Status, AssetType, PeriodType, Asset, Request, AuditLog, Role, TeamMember, Permission } from './types';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: '1',
    name: 'AWS Production Env',
    type: AssetType.CLOUD,
    category: 'Cloud Infrastructure',
    vendor: 'Amazon Web Services',
    owner: 'DevOps Team',
    department: 'Engineering',
    legalEntity: 'PT SubGuard Tech',
    amount: 15400000,
    currency: 'IDR',
    status: Status.ACTIVE,
    billingCycle: PeriodType.MONTHLY_FIX,
    nextRenewal: '2025-12-12',
    autoRenew: true,
    capex: false,
    notes: 'Main production cluster (ap-southeast-1)',
    remindersEnabled: true,
    reminderDaysBefore: 7,
    documents: ['aws-contract-2024.pdf'],
    utilization: 85,
    riskScore: 25,
    riskFactors: ['Variable Cost'],
    history: { sept: 14200000, oct: 14800000, nov: 15400000 }
  },
  {
    id: '2',
    name: 'Salesforce Enterprise',
    type: AssetType.SAAS,
    category: 'CRM',
    vendor: 'Salesforce',
    owner: 'Sarah Connor',
    department: 'Sales',
    legalEntity: 'PT SubGuard Commercial',
    amount: 45000000,
    currency: 'IDR',
    status: Status.ACTIVE,
    billingCycle: PeriodType.YEARLY,
    nextRenewal: '2026-01-15',
    autoRenew: false,
    capex: false,
    seats: 25,
    assignments: [
      { id: 'a1', assignee: 'Sales Team A', role: 'User', assignedDate: '2024-01-15' },
      { id: 'a2', assignee: 'John Doe', role: 'Admin', assignedDate: '2024-01-15' }
    ],
    notes: 'Contract #SF-2024-992. Negotiate seat count before renewal.',
    remindersEnabled: true,
    reminderDaysBefore: 60,
    documents: ['sf-invoice-q1.pdf', 'sf-sla.pdf'],
    utilization: 45, 
    riskScore: 65,
    riskFactors: ['High Dependency', 'Auto-Renew Clause'],
    history: { sept: 0, oct: 0, nov: 0 }
  },
  {
    id: '3',
    name: 'MacBook Pro M3 Max',
    type: AssetType.HARDWARE,
    category: 'Laptop',
    vendor: 'iBox',
    owner: 'John Doe',
    department: 'Design',
    legalEntity: 'PT SubGuard Tech',
    amount: 32000000,
    currency: 'IDR',
    status: Status.ACTIVE,
    billingCycle: PeriodType.ONE_TIME,
    purchaseDate: '2024-06-01',
    nextRenewal: '', 
    autoRenew: false,
    capex: true,
    depreciationMethod: 'Straight Line',
    serialNumber: 'FVFGH234JK',
    location: 'Jakarta HQ - 12th Floor',
    warrantyExpiry: '2025-06-01',
    notes: 'Asset Tag: SG-HW-004. High performance unit for video rendering.',
    remindersEnabled: false,
    reminderDaysBefore: 0,
    documents: ['po-00432.pdf', 'warranty-card.pdf'],
    utilization: 100,
    riskScore: 10,
    riskFactors: [],
    history: { sept: 0, oct: 0, nov: 0 }
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    type: AssetType.SOFTWARE,
    category: 'Design Tools',
    vendor: 'Adobe',
    owner: 'Design Team',
    department: 'Design',
    legalEntity: 'PT SubGuard Tech',
    amount: 8900000,
    currency: 'IDR',
    status: Status.ACTIVE,
    billingCycle: PeriodType.MONTHLY_FIX,
    nextRenewal: '2025-12-01',
    autoRenew: true,
    capex: false,
    seats: 10,
    notes: 'All Apps Plan for Design Team',
    remindersEnabled: true,
    reminderDaysBefore: 3,
    documents: [],
    utilization: 92,
    riskScore: 40,
    riskFactors: ['Price Hike Expected'],
    history: { sept: 8900000, oct: 8900000, nov: 8900000 }
  },
  {
    id: '5',
    name: 'Legacy ERP System',
    type: AssetType.SOFTWARE,
    category: 'ERP',
    vendor: 'Oracle',
    owner: 'IT Ops',
    department: 'Finance',
    legalEntity: 'Holding Corp',
    amount: 250000000,
    currency: 'IDR',
    status: Status.SUSPENDED,
    billingCycle: PeriodType.YEARLY,
    nextRenewal: '2025-06-30',
    autoRenew: true,
    capex: true,
    notes: 'Pending decommission approval. High cost.',
    remindersEnabled: true,
    reminderDaysBefore: 90,
    documents: ['oracle-legacy-contract.pdf'],
    utilization: 10,
    riskScore: 90,
    riskFactors: ['End of Life', 'High Cost', 'No Support'],
    history: { sept: 0, oct: 0, nov: 0 }
  }
];

export const INITIAL_REQUESTS: Request[] = [
  {
    id: 'r1',
    type: 'New Asset',
    item: 'Jira Premium License',
    requester: 'Tech Lead',
    department: 'Engineering',
    status: 'Pending',
    cost: 15000000,
    date: '2025-11-10'
  },
  {
    id: 'r2',
    type: 'Renewal',
    item: 'Zoom Enterprise',
    requester: 'Ops Manager',
    department: 'Operations',
    status: 'Pending',
    cost: 5500000,
    date: '2025-11-12'
  },
  {
    id: 'r3',
    type: 'Access',
    item: 'Tableau Seat',
    requester: 'Data Analyst',
    department: 'Marketing',
    status: 'Approved',
    cost: 1200000,
    date: '2025-11-01'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'l1',
    action: 'Asset Created',
    actor: 'System Admin',
    target: 'AWS Production Env',
    timestamp: '2024-01-15T09:00:00Z',
    details: 'Initial registration of cloud infrastructure.'
  },
  {
    id: 'l2',
    action: 'Document Uploaded',
    actor: 'Sarah Connor',
    target: 'Salesforce Enterprise',
    timestamp: '2024-02-10T14:30:00Z',
    details: 'Uploaded signed contract SF-2024-992.pdf'
  },
  {
    id: 'l3',
    action: 'Utilization Updated',
    actor: 'System Job',
    target: 'Adobe Creative Cloud',
    timestamp: '2024-11-01T00:00:00Z',
    details: 'Auto-scan detected 92% seat usage.'
  },
  {
    id: 'l4',
    action: 'Risk Alert',
    actor: 'System',
    target: 'Legacy ERP System',
    timestamp: '2024-11-05T08:00:00Z',
    details: 'Asset flagged as High Risk (Score: 90).'
  }
];

export const PERMISSIONS: Permission[] = [
  { id: 'view_assets', label: 'View Asset Registry', category: 'Assets' },
  { id: 'edit_assets', label: 'Create & Edit Assets', category: 'Assets' },
  { id: 'delete_assets', label: 'Delete/Archive Assets', category: 'Assets' },
  { id: 'view_finance', label: 'View Financial Data', category: 'Finance' },
  { id: 'approve_requests', label: 'Approve Budget Requests', category: 'Finance' },
  { id: 'manage_team', label: 'Manage Team Members', category: 'Team' },
  { id: 'manage_roles', label: 'Configure Roles', category: 'Team' },
  { id: 'manage_settings', label: 'System Settings', category: 'Settings' },
];

export const INITIAL_ROLES: Role[] = [
  { 
    id: 'admin', 
    name: 'Administrator', 
    description: 'Full access to all system features and settings.', 
    permissions: PERMISSIONS.map(p => p.id) 
  },
  { 
    id: 'manager', 
    name: 'Asset Manager', 
    description: 'Can manage assets and view financials, but cannot change system settings.', 
    permissions: ['view_assets', 'edit_assets', 'view_finance', 'approve_requests'] 
  },
  { 
    id: 'viewer', 
    name: 'Viewer', 
    description: 'Read-only access to the asset registry.', 
    permissions: ['view_assets'] 
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  { 
    id: 'u1', 
    name: 'Sarah Connor', 
    email: 'sarah@subguard.io', 
    roleId: 'admin', 
    department: 'Executive', 
    status: 'Active', 
    lastActive: '2025-01-20T10:30:00' 
  },
  { 
    id: 'u2', 
    name: 'John Doe', 
    email: 'john@subguard.io', 
    roleId: 'manager', 
    department: 'IT Ops', 
    status: 'Active', 
    lastActive: '2025-01-19T14:20:00' 
  },
  { 
    id: 'u3', 
    name: 'Mike Ross', 
    email: 'mike@subguard.io', 
    roleId: 'viewer', 
    department: 'Legal', 
    status: 'Inactive', 
    lastActive: '2024-12-15T09:00:00' 
  }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DEPARTMENTS = [
  'Engineering', 'Sales', 'Marketing', 'Finance', 'HR', 'Design', 'Operations', 'Executive'
];

export const CATEGORIES = [
  'Cloud Infrastructure', 'CRM', 'Laptop', 'Design Tools', 'Productivity', 'Security', 'Network', 'Facilities', 'Server', 'Fleet', 'ERP'
];
