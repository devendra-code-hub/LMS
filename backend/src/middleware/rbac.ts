import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { UserRole } from "../models/User";

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Access forbidden: insufficient permissions" });
      return;
    }
    next();
  };
};