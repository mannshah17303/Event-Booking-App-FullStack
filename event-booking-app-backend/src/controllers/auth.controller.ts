import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/sendResponse";

export const authController = {
  async getCurrentUser(req: Request, res: Response) {
    try {
      const token = req.cookies.token;
      if (!token) {
        return sendResponse(res, 401, "Not logged in");
      }

      const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
      res.status(200).json({ user: decoded });
    } catch (error: any) {
      sendResponse(res, 401, error.message || "Invalid token", null);
    }
  },
};
