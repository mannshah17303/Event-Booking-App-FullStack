import { Response } from "express";

export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data?: any,
  totalCount?: any
) => {
  if (totalCount !== undefined) {
    return res
      .status(statusCode)
      .json({ message: message, data: data, totalCount: totalCount });
  } else {
    return res.status(statusCode).json({ message: message, data: data });
  }
};