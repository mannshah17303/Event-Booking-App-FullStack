import { Contacts } from "../models";

export const contactRepository = {
  async getAllContacts() {
    return await Contacts.findAll();
  },

  async addContact(data: Contacts) {
    return await Contacts.create(data);
  },
};
