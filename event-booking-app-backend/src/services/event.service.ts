import { eventRepository } from "../repositories/event.repository";

export const eventService = {
  
  async getAllEvents() {
    return await eventRepository.getAllEvents();
  },
};
