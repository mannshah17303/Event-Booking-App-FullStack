import { Request, Response } from "express";
import { ticketService } from "../services/ticket.service";
import { sendResponse } from "../utils/sendResponse";

export const ticketController = {
  async addTicket(req: Request, res: Response) {
    try {
      const ticket = await ticketService.addTicket(req.body);
      sendResponse(res, 201, "ticket inserted successful", ticket);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async getAllTickets(req: Request, res: Response) {
    try {
      const tickets = await ticketService.getAllTickets();
      sendResponse(res, 200, "data fetched successful", tickets);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },
};
