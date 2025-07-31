import { Request, Response } from "express";
import { bookingService } from "../services/booking.service";
import { Bookings, Events } from "../models";
import { Op, Sequelize } from "sequelize";
import { sendResponse } from "../utils/sendResponse";

export const bookingController = {
  async addBooking(req: Request, res: Response) {
    try {
      const booking = await bookingService.addBooking(req.body);
      sendResponse(res, 201, "booking inserted successful", booking);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async createPaymentIntent(req: Request, res: Response) {
    try {
      const booking = await bookingService.createPaymentIntent(req.body);
      sendResponse(res, 201, "payment intent created successful", booking);
    } catch (error: any) {
      //status code 409(conflict)
      sendResponse(res, 409, error.message, null);
    }
  },

  async getAllBookingDetailsForPieChart(req: Request, res: Response) {
    try {
      const bookings = await bookingService.getAllBookingDetailsForPieChart();
      sendResponse(res, 200, "data fetched successful", bookings);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async getBookingsOfLoggedInUser(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const bookingData = await Bookings.findAll({
        include: [
          {
            model: Events,
            as: "event",
          },
        ],
        where: {
          user_id: userId,
        },
      });
      sendResponse(res, 200, "data fetched successful", bookingData);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async getBookedEventDetailsByEventId(req: Request, res: Response) {
    try {
      const eventId = req.query.eventId as string;

      const bookedEventDetailBasedOnId = await Bookings.findOne({
        include: {
          model: Events,
          as: "event",
        },
        where: {
          event_id: eventId,
        },
      });
      sendResponse(
        res,
        200,
        "data fetched successful",
        bookedEventDetailBasedOnId
      );
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async searchedSortPaginateBookings(req: Request, res: Response) {
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
      if (sortBy == "ratings") {
        const { count, rows } = await Bookings.findAndCountAll({
          include: {
            model: Events,
            where: {
              [Op.or]: [
                { event_title: { [Op.iLike]: `%${searchValue}%` } },
                { event_location: { [Op.iLike]: `%${searchValue}%` } },
              ],
            },
            as: "event",
          },
          limit: pageSize,
          offset: (page - 1) * pageSize,
          where: {
            user_id,
          },
          order: [["ratings", sortType]],
        });
        sendResponse(res, 200, "booking event fetched successful", rows, count);
      } else {
        const { count, rows } = await Bookings.findAndCountAll({
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
        sendResponse(res, 200, "booking event fetched successful", rows, count);
      }
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async updateBookingRatings(req: Request, res: Response) {
    try {
      const { rating, currentUserId } = req.body;

      const updatedBooking = await bookingService.updateBookingRatings(
        currentUserId,
        rating.id,
        rating.star
      );
      sendResponse(res, 200, "data fetched successful", updatedBooking);
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async deleteBooking(req: Request, res: Response) {
    try {
      const id = req.params.id;
      await bookingService.deleteBooking(id);
      sendResponse(res, 200, "booking deleted successful");
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },

  async averageRatings(req: Request, res: Response) {
    try {
      const ratings = await Bookings.findAll({
        attributes: [
          "event_id",
          [
            Sequelize.fn(
              "ROUND",
              Sequelize.fn("AVG", Sequelize.col('Bookings."ratings"')),
              2
            ),
            "avg_ratings",
          ],
        ],
        where: {
          ratings: {
            [Op.ne]: 0,
          },
        },
        group: ['Bookings."event_id"'],
      });
      sendResponse(res, 200, "user fetched successful", ratings);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },
};
