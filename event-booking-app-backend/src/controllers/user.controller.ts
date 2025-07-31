import bcrypt from "bcrypt";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Passwords, Users } from "../models";
import { mailService } from "../services/mail.service";
import { userService } from "../services/user.service";
import { sendResponse } from "../utils/sendResponse";

export const userController = {
  async registerUser(req: Request, res: Response) {
    try {
      const { name, email, role, password } = req.body;
      const user = await userService.registerUser(name, email, role, password);
      //status code 201(created)
      sendResponse(res, 201, "user inserted successful", user);
    } catch (error: any) {
      //status code 400(bad request)
      sendResponse(res, 400, error.message, null);
    }
  },

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await userService.findUserByEmail(email.trim());
      if (!user) {
        return sendResponse(res, 401, "Invalid credentials", null);
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return sendResponse(res, 401, "Invalid credentials", null);
      }

      const secret_key = process.env.SECRET_KEY as string;
      const payload = {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      const token = jwt.sign(payload, secret_key, { expiresIn: "1h" });

      const cookieOptions: CookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      };
      res.cookie("token", token, cookieOptions);
      sendResponse(res, 200, "Login successful", user);
    } catch (error: any) {
      //status code 500(internal server error)
      sendResponse(res, 500, error.message, null);
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const users = await userService.getAll();
      sendResponse(res, 200, "data fetched successful", users);
    } catch (error: any) {
      //status code 500(internal server error)
      sendResponse(res, 500, error.message, null);
    }
  },

  async getDataOfLoggedInUser(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const user = await userService.getDataOfLoggedInUser(userId);
      if (!user) {
        sendResponse(res, 404, "User not found", null);
      }
      sendResponse(res, 200, "data fetched successful", user);
    } catch (error: any) {
      //status code 500(internal server error)
      sendResponse(res, 500, error.message, null);
    }
  },

  async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const dataToUpdate = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
      };
      await userService.updateUser(id, dataToUpdate);
      const updatedUser = await Users.findOne({ where: { user_id: id } });
      const payload = {
        user_id: updatedUser!.user_id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        role: updatedUser!.role,
      };
      const secret_key = process.env.SECRET_KEY as string;
      const token = jwt.sign(payload, secret_key, { expiresIn: "1h" });
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        sameSite: "strict",
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      };
      res.cookie("token", token, cookieOptions);
      sendResponse(res, 200, "user updated successful", updatedUser);
    } catch (error: any) {
      //status code 400(bad request)
      sendResponse(res, 400, error.message, null);
    }
  },

  async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await userService.deleteUser(id);
      sendResponse(res, 200, "user deleted successful");
    } catch (error: any) {
      //status code 400(bad request)
      sendResponse(res, 400, error.message, null);
    }
  },

  async logout(req: Request, res: Response) {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });
    sendResponse(res, 200, "logout successful");
  },

  async forgetPassword(req: Request, res: Response) {
    const { email } = req.body;
    const user = await userService.findUserByEmail(email);
    if (!user) {
      sendResponse(res, 404, "user not found with this email");
    } else {
      try {
        const secret_key = process.env.SECRET_KEY as string;
        const token = jwt.sign({ email }, secret_key, { expiresIn: "15m" });
        const resetLink = `http://localhost:5173/reset-password?token=${token}`;
        await mailService.sendMail(
          email,
          "change password request",
          `Click the link below to reset your password`,
          `<a href="${resetLink}" target="_blank" style="padding: 10px 20px; background: #3182ce; color: white; border-radius: 4px; text-decoration: none;">Reset Password</a>`
        );
        sendResponse(res, 200, "email send successful");
      } catch (error: any) {
        //status code 500(internal server error)
        sendResponse(res, 500, error.message, null);
      }
    }
  },

  async resetPassword(req: Request, res: Response) {
    const { password, token } = req.body;
    const secret_key = process.env.SECRET_KEY as string;
    const decoded = jwt.verify(token, secret_key) as { email: string };

    try {
      const foundUser = await Users.findOne({
        where: {
          email: decoded.email,
        },
      });
      const existingPasswords = await Passwords.findAll({
        where: {
          user_id: foundUser?.user_id,
        },
      });
      for (const storedPassword of existingPasswords) {
        const isMatch = await bcrypt.compare(password, storedPassword.password);
        if (isMatch) {
          //status code 400(bad request)
          return sendResponse(res, 400, "Password cannot be same again");
        }
      }
      const newPassword = await userService.resetPassword(
        decoded.email,
        password,
        foundUser?.user_id as string
      );
      sendResponse(res, 200, "password reset successful", newPassword);
    } catch (error: any) {
      //status code 500(internal server error)
      sendResponse(res, 500, error.message, null);
    }
  },
};
