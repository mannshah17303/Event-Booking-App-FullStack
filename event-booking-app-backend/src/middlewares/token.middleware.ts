import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export function checkToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ message: "Access denied.No User Available" });
    return;
  }

  try {
    const secret_key = process.env.SECRET_KEY as string;
    const decoded = jwt.verify(token, secret_key);
    (req as jwt.JwtPayload).user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function checkIfAuthenticatedUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (!token) {
    return next();
  }

  try {
    const secret_key = process.env.SECRET_KEY as string;
    const decoded = jwt.verify(token, secret_key) as jwt.JwtPayload;

    if (decoded?.email === req.body.email) {
      res.status(400).json("You are already logged in.");
      return;
    }

    return next();
  } catch (err) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });
    return next();
  }
}
