import { sequelize } from "../config/database";
import { Passwords, Users } from "../models";
import { BaseRepository } from "./base.repository";

export const userRepository = {
  async getAll() {
    const userRepo = new BaseRepository(Users.scope("withBookings"));
    return await userRepo.findAll();
  },

  async registerUser(
    name: string,
    email: string,
    role: string,
    password: string
  ) {
    const t = await sequelize.transaction();
    try {
      const user = new BaseRepository(Users);
      const createdUser = await user.create(
        {
          name,
          email,
          role,
          password,
        },
        { transaction: t }
      );

      await Passwords.create(
        {
          user_id: createdUser.user_id,
          password: createdUser.password,
        } as any,
        { transaction: t }
      );

      await t.commit();

      return {
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        password: createdUser.password,
      };
    } catch (error) {
      await t.rollback();
    }
  },

  async findUserByEmail(email: string) {
    return Users.findOne({
      where: {
        email,
      },
    });
  },

  async getDataOfLoggedInUser(userId: string) {
    const userRepo = new BaseRepository(Users.scope("withBookings"));
    return await userRepo.findAll({
      where: {
        user_id: userId,
      },
    });
  },

  async updateUser(
    id: string,
    updatedData: { name: string; email: string; role: string }
  ) {
    return await new BaseRepository(Users).update(updatedData, {
      where: {
        user_id: id,
      },
    });
  },

  async resetPassword(email: string, password: string, userId: string) {
    const t = await sequelize.transaction();
    try {
      await Passwords.create(
        {
          user_id: userId,
          password: password,
        } as any,
        { transaction: t }
      );
      await new BaseRepository(Users).update(
        { password },
        {
          where: {
            email,
          },
          transaction: t,
        }
      );

      await t.commit();
      return {
        success: true,
      };
    } catch (error) {
      await t.rollback();
    }
  },

  async deleteUser(userId: string) {
    return await new BaseRepository(Users).delete({
      where: {
        user_id: userId,
      },
    });
  },
};
