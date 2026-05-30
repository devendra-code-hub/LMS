import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { authorize } from "../middleware/rbac";
import User from "../models/User";

const router = Router();

// GET /api/sales/leads — users who signed up but haven't applied
router.get(
  "/leads",
  authenticate,
  authorize("sales", "admin"),
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const leads = await User.find({
        role: "borrower",
      })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(leads);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  }
);

export default router;