import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole =
  | "borrower"
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  // Borrower-specific fields
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: "Salaried" | "Self-Employed" | "Unemployed";
  breStatus?: "pending" | "passed" | "failed";
  breFailReason?: string;
  salarySlipUrl?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["borrower", "admin", "sales", "sanction", "disbursement", "collection"],
      default: "borrower",
    },
    pan: { type: String, uppercase: true },
    dob: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: {
      type: String,
      enum: ["Salaried", "Self-Employed", "Unemployed"],
    },
    breStatus: {
      type: String,
      enum: ["pending", "passed", "failed"],
      default: "pending",
    },
    breFailReason: { type: String },
    salarySlipUrl: { type: String },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);