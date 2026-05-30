import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User, { UserRole } from "./models/User";

const seedUsers: { name: string; email: string; password: string; role: UserRole }[] = [
  { name: "Admin User",       email: "admin@lms.com",        password: "Admin@123",    role: "admin" },
  { name: "Sales Executive",  email: "sales@lms.com",        password: "Sales@123",    role: "sales" },
  { name: "Sanction Officer", email: "sanction@lms.com",     password: "Sanction@123", role: "sanction" },
  { name: "Disburse Officer", email: "disbursement@lms.com", password: "Disburse@123", role: "disbursement" },
  { name: "Collection Agent", email: "collection@lms.com",   password: "Collect@123",  role: "collection" },
  { name: "Test Borrower",    email: "borrower@lms.com",     password: "Borrow@123",   role: "borrower" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI as string);
  await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });
  for (const u of seedUsers) {
    await User.create(u);
  }
  console.log("✅ Seeded users:");
  seedUsers.forEach((u) => console.log(`  ${u.role}: ${u.email} / ${u.password}`));
  await mongoose.disconnect();
}

seed().catch(console.error);