import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import {
  Bookings,
  Contacts,
  Events,
  Favorites,
  GroupEventMembers,
  GroupEvents,
  models,
  Passwords,
  Payments,
  Tickets,
  Users,
} from "../models";

dotenv.config();
const databaseUrl = process.env.DATABASE_URL;

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      models: [
        Users,
        Events,
        Bookings,
        Favorites,
        Contacts,
        Tickets,
        Payments,
        Passwords,
        GroupEvents,
        GroupEventMembers,
      ],
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    })
  : new Sequelize({
      dialect: "postgres",
      host: process.env.HOST,
      username: process.env.NAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      models,
      logging: false,
    });
