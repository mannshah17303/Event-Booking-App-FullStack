import { Request, Response } from "express";
import { Payments } from "../models";
import { Op } from "sequelize";
import { sendResponse } from "../utils/sendResponse";

export const paymentController = {
  async getPaymentDetails(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      const paymentDetail = await Payments.findAll({
        where: {
          user_id: userId,
          booking_id: {
            [Op.not]: null,
          } as any,
        },
      });
      sendResponse(res, 200, "data fetched successful", paymentDetail);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },
};
