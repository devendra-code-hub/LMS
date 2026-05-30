import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import User from "../models/User";
import Loan from "../models/Loan";
import { runBRE } from "../services/bre";

const router = Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, JPG, PNG allowed"));
  },
});

// POST /api/borrower/personal — Step 2
router.post(
  "/personal",
  authenticate,
  authorize("borrower"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { pan, dob, monthlySalary, employmentMode } = req.body;
      const breResult = runBRE({ pan, dob: new Date(dob), monthlySalary: Number(monthlySalary), employmentMode });

      const update: Partial<{
        pan: string;
        dob: Date;
        monthlySalary: number;
        employmentMode: string;
        breStatus: string;
        breFailReason: string;
      }> = {
        pan,
        dob: new Date(dob),
        monthlySalary: Number(monthlySalary),
        employmentMode,
        breStatus: breResult.passed ? "passed" : "failed",
      };
      if (!breResult.passed) update.breFailReason = breResult.reason;

      await User.findByIdAndUpdate(req.user!.id, update);

      if (!breResult.passed) {
        res.status(422).json({ passed: false, reason: breResult.reason });
        return;
      }
      res.json({ passed: true });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// POST /api/borrower/upload — Step 3
router.post(
  "/upload",
  authenticate,
  authorize("borrower"),
  upload.single("salarySlip"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
      }
      await User.findByIdAndUpdate(req.user!.id, {
        salarySlipUrl: req.file.path,
      });
      res.json({ message: "Salary slip uploaded", filePath: req.file.path });
    } catch (err) {
      res.status(500).json({ message: "Upload error", error: err });
    }
  }
);

// POST /api/borrower/apply — Step 4
router.post(
  "/apply",
  authenticate,
  authorize("borrower"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id);
      if (!user || user.breStatus !== "passed") {
        res.status(403).json({ message: "BRE not passed. Not eligible to apply." });
        return;
      }
      const existing = await Loan.findOne({
        borrower: req.user!.id,
        status: { $in: ["APPLIED", "SANCTIONED", "DISBURSED"] },
      });
      if (existing) {
        res.status(400).json({ message: "You already have an active loan application" });
        return;
      }
      const { amount, tenure } = req.body;
      const P = Number(amount);
      const T = Number(tenure);
      const R = 12;
      const SI = (P * R * T) / (365 * 100);
      const totalRepayment = P + SI;

      const loan = await Loan.create({
        borrower: req.user!.id,
        amount: P,
        tenure: T,
        interestRate: R,
        simpleInterest: parseFloat(SI.toFixed(2)),
        totalRepayment: parseFloat(totalRepayment.toFixed(2)),
        status: "APPLIED",
      });
      res.status(201).json({ message: "Loan application submitted", loan });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// GET /api/borrower/my-loans
router.get(
  "/my-loans",
  authenticate,
  authorize("borrower"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loans = await Loan.find({ borrower: req.user!.id }).sort({ createdAt: -1 });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// GET /api/borrower/profile
router.get(
  "/profile",
  authenticate,
  authorize("borrower"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await User.findById(req.user!.id).select("-password");
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default router;