import { Users } from "../models";
import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";

export const userService = {
  async getAll() {
    return await userRepository.getAll();
  },

  async registerUser(name:string, email:string, role:string, password:string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    password = hashedPassword;
    const user = await userRepository.registerUser(name, email, role, password);
    return user;
  },

  async findUserByEmail(email:string){
    const user = await userRepository.findUserByEmail(email);
    return user;
  },

  async getDataOfLoggedInUser(userId:string){
    
    const user = await userRepository.getDataOfLoggedInUser(userId)
    return user
  },


  async updateUser(
    id: string,
    updatedData: { name: string; email: string; role: string }
  ) {
    return userRepository.updateUser(id, updatedData);
  },

  async resetPassword(email:string, password:string, userId:string){

    const hashedPassword = await bcrypt.hash(password, 10);
    return userRepository.resetPassword(email, hashedPassword, userId)
  },

  async deleteUser(id: string) {
    return userRepository.deleteUser(id);
  },
};
