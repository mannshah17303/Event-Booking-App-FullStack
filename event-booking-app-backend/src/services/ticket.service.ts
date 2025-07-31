import { Tickets } from "../models";
import { ticketRepository } from "../repositories/ticket.repository";

export const ticketService = {
  async addTicket(data: Tickets) {
    const ticket = await ticketRepository.addTicket(data);
    return ticket;
  },
  async getAllTickets() {
    return await ticketRepository.getAllTickets();
  },
};
