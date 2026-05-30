import mongoose, { Document, Schema } from "mongoose";

export type LoanStatus =
  | "APPLIED"
  | "SANCTIONED"
  | "DISBURSED"
  | "CLOSED"
  | "REJECTED";

export interface ILoan extends Document {
  borrower: mongoose.Types.ObjectId;
  amount: number;
  tenure: number; // in days
  interestRate: number; // fixed 12% p.a.
  simpleInterest: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  disbursedAt?: Date;
  closedAt?: Date;
  sanctionedBy?: mongoose.Types.ObjectId;
  disbursedBy?: mongoose.Types.ObjectId;
  amountPaid: number;
}

const LoanSchema = new Schema<ILoan>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    status: {
      type: String,
      enum: ["APPLIED", "SANCTIONED", "DISBURSED", "CLOSED", "REJECTED"],
      default: "APPLIED",
    },
    rejectionReason: { type: String },
    disbursedAt: { type: Date },
    closedAt: { type: Date },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: "User" },
    disbursedBy: { type: Schema.Types.ObjectId, ref: "User" },
    amountPaid: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<ILoan>("Loan", LoanSchema);