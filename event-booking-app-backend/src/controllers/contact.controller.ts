import { Request, Response } from "express";
import { contactService } from "../services/contact.service";
import { sendResponse } from "../utils/sendResponse";

export const contactController = {
  async addContact(req: Request, res: Response) {
    try {
      const contact = await contactService.addContact(req.body);
      sendResponse(res, 201, "contact inserted successful", contact);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async getAllContacts(req: Request, res: Response) {
    try {
      const contacts = await contactService.getAllContacts();
      sendResponse(res, 200, "data fetched successful", contacts);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },
};
