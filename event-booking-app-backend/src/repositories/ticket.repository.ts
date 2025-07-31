import { Tickets } from "../models";

export const ticketRepository = {
  async getAllTickets() {
    return await Tickets.findAll();
  },

  async addTicket(data: Tickets) {
    return await Tickets.create(data);
  },
};
