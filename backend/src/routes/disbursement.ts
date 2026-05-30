import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import Loan from "../models/Loan";

const router = Router();

// GET /api/disbursement/sanctioned
router.get(
  "/sanctioned",
  authenticate,
  authorize("disbursement", "admin"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loans = await Loan.find({ status: "SANCTIONED" })
        .populate("borrower", "-password")
        .sort({ createdAt: -1 });
      res.json(loans);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

// PATCH /api/disbursement/:loanId/disburse
router.patch(
  "/:loanId/disburse",
  authenticate,
  authorize("disbursement", "admin"),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const loan = await Loan.findOneAndUpdate(
        { _id: req.params.loanId, status: "SANCTIONED" },
        { status: "DISBURSED", disbursedAt: new Date(), disbursedBy: req.user!.id },
        { new: true }
      );
      if (!loan) {
        res.status(404).json({ message: "Loan not found or not in SANCTIONED state" });
        return;
      }
      res.json({ message: "Loan disbursed", loan });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default router;