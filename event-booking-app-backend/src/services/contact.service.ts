import { Contacts } from "../models";
import { contactRepository } from "../repositories/contact.repository";

export const contactService = {
  async addContact(data: Contacts) {
    const contact = await contactRepository.addContact(data);
    return contact;
  },
  async getAllContacts() {
    return await contactRepository.getAllContacts();
  },
};
