import { Events } from "../models";

export const eventRepository = {
  async getAllEvents() {
    return await Events.findAll();
  },
};
