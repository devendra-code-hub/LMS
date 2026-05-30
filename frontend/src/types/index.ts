export type UserRole = "borrower" | "admin" | "sales" | "sanction" | "disbursement" | "collection";
export type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "CLOSED" | "REJECTED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  breStatus?: "pending" | "passed" | "failed";
  breFailReason?: string;
  pan?: string;
  monthlySalary?: number;
  employmentMode?: string;
  salarySlipUrl?: string;
}

export interface Loan {
  _id: string;
  borrower: User | string;
  amount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  amountPaid: number;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  recordedBy: { name: string };
}

export interface AuthResponse {
  token: string;
  user: User;
}