export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  meterNo: string;
  phone: string;
}

export interface Bill {
  id: string;
  userId: string;
  units: number;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'Paid' | 'Unpaid';
  generatedDate: string;
  dueDate: string;
  paidDate?: string;
  paymentId?: string;
}

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  meterNo: string;
  phone: string;
}

export interface BillGenerationFormData {
  units: number;
}

export interface TaxReport {
  year: number;
  month: number;
  totalBills: number;
  totalUnits: number;
  totalAmount: number;
  totalTax: number;
  totalRevenue: number;
}