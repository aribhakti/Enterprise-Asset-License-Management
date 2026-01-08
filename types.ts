
export enum Status {
  PLANNED = 'Planned',
  REQUESTED = 'Requested',
  APPROVED = 'Approved',
  ACTIVE = 'Active',
  SUSPENDED = 'Suspended',
  RETIRED = 'Retired',
  DISPOSED = 'Disposed',
  ARCHIVED = 'Archived'
}

export enum AssetType {
  SAAS = 'SaaS',
  SOFTWARE = 'Software License',
  HARDWARE = 'Hardware',
  CLOUD = 'Cloud Resource',
  SERVICE = 'Connectivity / Service'
}

export enum PeriodType {
  MONTHLY_FIX = 'Monthly',
  YEARLY = 'Yearly',
  ONE_TIME = 'One-Time / Perpetual',
  QUARTERLY = 'Quarterly'
}

export interface Assignment {
  id: string;
  assignee: string; 
  role: string;
  assignedDate: string;
}

export interface Asset {
  id: string;
  name: string;          
  type: AssetType;       
  category: string;      
  vendor: string;        
  owner: string;         
  department: string;    
  legalEntity?: string;  
  amount: number;        
  currency: 'IDR' | 'USD';
  status: Status;
  billingCycle: PeriodType;
  purchaseDate?: string;
  nextRenewal: string;
  autoRenew: boolean;
  
  capex: boolean;        
  depreciationMethod?: 'Straight Line' | 'Double Declining' | 'None';
  
  seats?: number;        
  assignments?: Assignment[]; 
  
  serialNumber?: string;
  location?: string;
  warrantyExpiry?: string;

  notes: string;
  remindersEnabled: boolean;
  reminderDaysBefore: number;
  
  documents?: string[];  
  utilization?: number;
  riskScore?: number; 
  riskFactors?: string[]; 
  history?: {
    sept?: number;
    oct?: number;
    nov?: number;
  };
}

export interface AuditLog {
  id: string;
  action: string;      
  actor: string;       
  target: string;      
  timestamp: string;
  details: string;
}

export interface Request {
  id: string;
  type: 'New Asset' | 'Renewal' | 'Access';
  item: string;
  requester: string;
  department: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  cost: number;
  date: string;
}

export interface User {
  id: string;
  email: string;
  businessName: string;
  password?: string; // Only used for internal auth logic, not exposed in UI
}

// New Types for User Management
export interface Permission {
  id: string;
  label: string;
  category: 'Assets' | 'Finance' | 'Settings' | 'Team';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // List of Permission IDs
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  department: string;
  status: 'Active' | 'Inactive';
  lastActive: string;
  avatar?: string;
}

export type AuthMode = 'signin' | 'signup' | 'forgot' | 'verify';

export interface DashboardConfig {
  currency: 'IDR' | 'USD';
  showAiInsights: boolean;
  showEventLog: boolean;
  softMode: boolean;
  categories: string[];
  departments: string[];
  monthlyBudget: number;
  
  // Checker Maker Settings
  enableCheckerMaker: boolean;
  checkerThreshold: number;
  checkerRole: string;
  
  language: string;
  enableRtl: boolean;
  primaryColor: string;
  sidebarTransparent: boolean;
  darkMode: boolean;

  dateFormat: string;
  timeFormat: string;
  customerPrefix: string;
  vendorPrefix: string;
  invoicePrefix: string;
  proposalPrefix: string;
  billPrefix: string;
  quotationPrefix: string;
  displayShipping: boolean;
  invoiceFooter: string;

  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyCountry: string;
  companyPhone: string;
  companyReg: string;
  startTime: string;
  endTime: string;
  ipRestriction: boolean;
  timezone: string;
  taxNumber: boolean;

  decimalFormat: string;
  currencyPosition: string;

  mailDriver: string;
  mailHost: string;
  mailPort: string;
  mailUsername: string;
  mailPassword: string;
  mailEncryption: string;
  mailFromAddress: string;
  mailFromName: string;

  paymentGateways: Record<string, boolean>;
}
