import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import Loan from "../models/Loan";
import Payment from "../models/Payment";

const router = Router();

// GET /api/collection/active-loans
router.get(
  "/active-loans",
  authenticate,
  authorize("collection", "admin"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loans = await Loan.find({ status: "DISBURSED" })
        .populate("borrower", "-password")
        .sort({ disbursedAt: -1 });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// POST /api/collection/:loanId/payment
router.post(
  "/:loanId/payment",
  authenticate,
  authorize("collection", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { utrNumber, amount, paymentDate } = req.body;
      if (!utrNumber || !amount || !paymentDate) {
        res.status(400).json({ message: "UTR, amount, and date are required" });
        return;
      }

      const loan = await Loan.findOne({ _id: req.params.loanId, status: "DISBURSED" });
      if (!loan) {
        res.status(404).json({ message: "Active loan not found" });
        return;
      }

      const parsedAmount = Number(amount);
      const outstanding = loan.totalRepayment - loan.amountPaid;
      if (parsedAmount <= 0 || parsedAmount > outstanding) {
        res.status(400).json({
          message: `Payment amount must be between ₹1 and ₹${outstanding.toFixed(2)} (outstanding)`,
        });
        return;
      }

      // Check UTR uniqueness
      const existingPayment = await Payment.findOne({ utrNumber: utrNumber.toUpperCase() });
      if (existingPayment) {
        res.status(400).json({ message: "UTR number already exists. Must be unique." });
        return;
      }

      const payment = await Payment.create({
        loan: loan._id,
        borrower: loan.borrower,
        utrNumber: utrNumber.toUpperCase(),
        amount: parsedAmount,
        paymentDate: new Date(paymentDate),
        recordedBy: req.user!.id,
      });

      loan.amountPaid = parseFloat((loan.amountPaid + parsedAmount).toFixed(2));
      if (loan.amountPaid >= loan.totalRepayment) {
        loan.status = "CLOSED";
        loan.closedAt = new Date();
      }
      await loan.save();

      res.status(201).json({
        message: loan.status === "CLOSED" ? "Payment recorded. Loan auto-closed!" : "Payment recorded",
        payment,
        loanStatus: loan.status,
        amountPaid: loan.amountPaid,
        outstanding: parseFloat((loan.totalRepayment - loan.amountPaid).toFixed(2)),
      });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// GET /api/collection/:loanId/payments
router.get(
  "/:loanId/payments",
  authenticate,
  authorize("collection", "admin"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const payments = await Payment.find({ loan: _req.params.loanId })
        .populate("recordedBy", "name")
        .sort({ paymentDate: -1 });
      res.json(payments);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default router;