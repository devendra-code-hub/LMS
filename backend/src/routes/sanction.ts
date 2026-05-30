import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import Loan from "../models/Loan";

const router = Router();

// GET /api/sanction/applications
router.get(
  "/applications",
  authenticate,
  authorize("sanction", "admin"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loans = await Loan.find({ status: "APPLIED" })
        .populate("borrower", "-password")
        .sort({ createdAt: -1 });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// PATCH /api/sanction/:loanId/approve
router.patch(
  "/:loanId/approve",
  authenticate,
  authorize("sanction", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loan = await Loan.findOneAndUpdate(
        { _id: req.params.loanId, status: "APPLIED" },
        { status: "SANCTIONED", sanctionedBy: req.user!.id },
        { new: true }
      );
      if (!loan) {
        res.status(404).json({ message: "Loan not found or not in APPLIED state" });
        return;
      }
      res.json({ message: "Loan sanctioned", loan });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// PATCH /api/sanction/:loanId/reject
router.patch(
  "/:loanId/reject",
  authenticate,
  authorize("sanction", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reason } = req.body;
      if (!reason) {
        res.status(400).json({ message: "Rejection reason required" });
        return;
      }
      const loan = await Loan.findOneAndUpdate(
        { _id: req.params.loanId, status: "APPLIED" },
        { status: "REJECTED", rejectionReason: reason },
        { new: true }
      );
      if (!loan) {
        res.status(404).json({ message: "Loan not found or not in APPLIED state" });
        return;
      }
      res.json({ message: "Loan rejected", loan });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default router;