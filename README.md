# Loan Management System 

A full-stack lending platform where borrowers apply for loans and internal executives manage them through their lifecycle.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose
- **Auth**: JWT + bcrypt

## Features

### Borrower Portal
- Multi-step loan application flow (Sign Up → Personal Details → Salary Slip Upload → Loan Configuration)
- Business Rule Engine (BRE) — server-side eligibility check (age, salary, PAN, employment)
- Live loan calculator with Simple Interest: `SI = (P × R × T) / (365 × 100)`
- Loan status tracking dashboard

### Operations Dashboard
- **Sales** — Lead tracking (registered borrowers)
- **Sanction** — Review, approve, or reject loan applications with reason
- **Disbursement** — Mark sanctioned loans as disbursed
- **Collection** — Record payments (UTR-based, unique), auto-close loan on full repayment

### Role-Based Access Control (RBAC)
- Enforced on both frontend (route guards) and backend (middleware)
- Roles: `Admin`, `Sales`, `Sanction`, `Disbursement`, `Collection`, `Borrower`
- API returns `403 Forbidden` for unauthorized access — hiding menu items is not enough

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET in .env
npm run dev
```

Seed test accounts:
```bash
npm run seed
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App runs at **http://localhost:3000**

## Login Credentials

| Role         | Email                  | Password      |
|--------------|------------------------|---------------|
| Admin        | admin@lms.com          | Admin@123     |
| Sales        | sales@lms.com          | Sales@123     |
| Sanction     | sanction@lms.com       | Sanction@123  |
| Disbursement | disbursement@lms.com   | Disburse@123  |
| Collection   | collection@lms.com     | Collect@123   |
| Borrower     | borrower@lms.com       | Borrow@123    |

## Loan Lifecycle

```
APPLIED → SANCTIONED → DISBURSED → CLOSED
              ↓
           REJECTED
```

## BRE Rules (Server-Side)

| Rule       | Condition                        |
|------------|----------------------------------|
| Age        | Must be between 23 and 50        |
| Salary     | Minimum ₹25,000/month            |
| PAN        | Valid format: `ABCDE1234F`       |
| Employment | Must not be Unemployed           |

## API Endpoints

| Method | Endpoint                          | Role        |
|--------|-----------------------------------|-------------|
| POST   | /api/auth/signup                  | Public      |
| POST   | /api/auth/login                   | Public      |
| POST   | /api/borrower/personal            | Borrower    |
| POST   | /api/borrower/upload              | Borrower    |
| POST   | /api/borrower/apply               | Borrower    |
| GET    | /api/borrower/my-loans            | Borrower    |
| GET    | /api/sales/leads                  | Sales/Admin |
| GET    | /api/sanction/applications        | Sanction/Admin |
| PATCH  | /api/sanction/:id/approve         | Sanction/Admin |
| PATCH  | /api/sanction/:id/reject          | Sanction/Admin |
| GET    | /api/disbursement/sanctioned      | Disbursement/Admin |
| PATCH  | /api/disbursement/:id/disburse    | Disbursement/Admin |
| GET    | /api/collection/active-loans      | Collection/Admin |
| POST   | /api/collection/:id/payment       | Collection/Admin |

## Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```