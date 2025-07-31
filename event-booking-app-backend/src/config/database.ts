import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { models } from "../models";

dotenv.config();

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.HOST,
  username: process.env.NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  models,
  logging: false,
});
