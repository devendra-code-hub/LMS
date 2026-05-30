import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  loan: mongoose.Types.ObjectId;
  borrower: mongoose.Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  recordedBy: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
  {
    loan: { type: Schema.Types.ObjectId, ref: "Loan", required: true },
    borrower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber: { type: String, required: true, unique: true, uppercase: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);