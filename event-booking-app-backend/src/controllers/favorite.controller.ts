import { Request, Response } from "express";
import { Op } from "sequelize";
import { Events, Favorites } from "../models";
import { favoriteService } from "../services/favorite.service";
import { sendResponse } from "../utils/sendResponse";

export const favoriteController = {
  async addFavorite(req: Request, res: Response) {
    try {
      const { event_id, currentUserId } = req.body;
      const favorite = await favoriteService.addFavorite(
        event_id,
        currentUserId
      );
      sendResponse(res, 201, "favorite inserted successful", favorite);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async getAllFavorites(req: Request, res: Response) {
    try {
      const favorites = await favoriteService.getAllFavorites();
      sendResponse(res, 200, "data fetched successful", favorites);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async showRedColorInFavoriteEvents(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;

      const response = await Favorites.findAll({
        where: {
          user_id: userId,
        },
      });
      sendResponse(res, 200, "event fetched successful", response);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async searchedSortPaginateFavorites(req: Request, res: Response) {
    try {
      const searchValue = (req.query?.value as string) || "";
      const page: number = Number(req.query?.page) || 1;
      const pageSize: number = Number(req.query?.pageSize) || 5;
      const sortType: string = (req.query?.sortType as string) || "ASC";
      let sortBy: string = (req.query?.sortBy as string) || "event_id";
      const user_id: string = req.query?.user_id as string;
      if (sortBy === "name") {
        sortBy = "event_title";
      } else if (sortBy === "date") {
        sortBy = "event_date";
      } else if (sortBy === "location") {
        sortBy = "event_location";
      }
      const { count, rows } = await Favorites.findAndCountAll({
        include: {
          model: Events,
          where: {
            [Op.or]: [
              { event_title: { [Op.iLike]: `%${searchValue}%` } },
              { event_location: { [Op.iLike]: `%${searchValue}%` } },
            ],
          },
        },
        limit: pageSize,
        offset: (page - 1) * pageSize,
        where: {
          user_id,
        },
        order: [[{ model: Events, as: "event" }, sortBy, sortType]],
      });
      sendResponse(res, 200, "event fetched successful", rows, count);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async removeFavorite(req: Request, res: Response) {
    try {
      const { event_id, currentUserId } = req.body;
      const favorite = await favoriteService.removeFavorite(
        event_id,
        currentUserId
      );
      sendResponse(res, 200, "favorite removed successful", favorite);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },
};
