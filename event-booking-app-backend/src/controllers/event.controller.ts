import { Request, Response } from "express";
import { Op } from "sequelize";
import { sequelize } from "../config/database";
import { Events } from "../models";
import { eventService } from "../services/event.service";
import { sendResponse } from "../utils/sendResponse";

export const eventController = {
  async getAllEvents(req: Request, res: Response) {
    try {
      const events = await eventService.getAllEvents();
      sendResponse(res, 200, "data fetched successful", events);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async searchedSortPaginateEvent(req: Request, res: Response) {
    try {
      const searchValue = (req.query?.value as string) || "";
      const page = Number(req.query?.page) || 1;
      const pageSize = Number(req.query?.pageSize) || 5;
      const sortType = (req.query?.sortType as string) || "ASC";
      let sortBy = (req.query?.sortBy as string) || "event_id";
      const today = new Date().toISOString().split("T")[0];
      
      if (sortBy === "name") {
        sortBy = "event_title";
      } else if (sortBy === "date") {
        sortBy = "event_date";
      } else if (sortBy === "location") {
        sortBy = "event_location";
      }

      if (sortBy === "ratings") {
        try {
          const [rows] = await sequelize.query(`
            SELECT 
              e.event_id,e.event_location,e.price,e.event_description,e.event_title,e.event_date,e.image_url,
              COALESCE(ROUND(AVG(CASE WHEN b.ratings > 0 THEN b.ratings ELSE NULL END), 2), 0) AS avg_ratings
            FROM "Events" e
            LEFT JOIN "Bookings" b ON e.event_id = b.event_id where e.event_date >= '${today}'
            GROUP BY e.event_id,e.event_location,e.price,e.event_description,e.event_title,e.event_date,e.image_url
            ORDER BY avg_ratings ${sortType.toUpperCase()}
            LIMIT ${pageSize}
            OFFSET ${(page - 1) * pageSize}
          `);
          const [[{ total }]]: any = await sequelize.query(
            `SELECT COUNT(*) as total FROM "Events"`
          );
          sendResponse(
            res,
            200,
            "event fetched successful",
            rows,
            parseInt(total)
          );
        } catch (error: any) {
          sendResponse(res, 500, error.message, null);
        }
      } else {
        const { count, rows } = await Events.findAndCountAll({
          limit: pageSize,
          offset: (page - 1) * pageSize,
          order: [[sortBy, sortType]],
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  { event_title: { [Op.iLike]: `%${searchValue}%` } },
                  { event_location: { [Op.iLike]: `%${searchValue}%` } },
                ],
              },
              {
                event_date: {
                  [Op.gte]: today,
                },
              },
            ],
          },
        });
        sendResponse(res, 200, "event fetched successful", rows, count);
      }
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async getEventDetailsByEventId(req: Request, res: Response) {
    try {
      const eventId = Number(req.query.eventId);
      const eventDetailByEventId = await Events.findOne({
        where: {
          event_id: eventId,
        },
      });
      sendResponse(res, 200, "event fetched successful", eventDetailByEventId);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },
};
