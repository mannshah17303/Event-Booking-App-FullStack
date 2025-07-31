import { sequelize } from "../config/database";
import { Bookings, Events, Tickets } from "../models";
import { Payments } from "../models/payments.model";
import { stripeInstance } from "../utils/stripe";

export const bookingRepository = {
  async getAllBookingDetailsForPieChart() {
    const booking = await Bookings.findAll({
      attributes: [
        "event_id",
        [sequelize.fn("COUNT", sequelize.col("booking_id")), "bookingCount"],
      ],
      include: [
        {
          model: Events,
          attributes: ["event_id", "event_location"],
        },
      ],
      group: ["Bookings.event_id", "event.event_id", "event.event_location"],
    });
    return booking;

    //one to one relationship(one user has only one booked ticket)
    // return await Bookings.findAll({
    //   attributes: ["booking_id", "user_id", "event_id"],
    //   include: {
    //     model: Tickets,
    //     attributes: ["ticket_id", "quantity", "total_amount"],
    //   },
    // });
  },
  async updateBookingRatings(
    currentUserId: string,
    ratingId: number,
    ratingStar: number
  ) {
    return await Bookings.update(
      {
        ratings: ratingStar,
      },
      {
        where: {
          user_id: currentUserId,
          event_id: ratingId,
        },
      }
    );
  },

  async createPaymentIntent(data: {
    user_id: string;
    event_id: number;
    booking_date: string;
    quantity: number;
    price_per_ticket: number;
  }) {
    try {
      const isEventAlreadyBooked = await Bookings.findOne({
        where:{
          user_id:data.user_id,
          event_id:data.event_id
        }
      })
      if(isEventAlreadyBooked){
        throw new Error("event is already booked")
      }
      const amount = data.quantity * data.price_per_ticket;

      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount,
        currency: "INR",
        payment_method_types: ["card"],
        confirm: true,
        payment_method: "pm_card_visa",
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: "INR",
      };
    } catch (error:any) {
      throw error;
    }
  },

  async addBooking(data: {
    user_id: string;
    event_id: number;
    booking_date: string;
    quantity: number;
    price_per_ticket: number;
    paymentIntentId: string;
  }) {
    const t = await sequelize.transaction();
    try {
      const amount = data.quantity * data.price_per_ticket;

      const booking = await Bookings.create(
        {
          user_id: data.user_id,
          event_id: data.event_id,
          booking_date: new Date(data.booking_date),
        } as any,
        { transaction: t }
      );

      const payment = await Payments.create(
        {
          booking_id: booking.booking_id,
          user_id: data.user_id,
          amount: amount,
          status: "paid",
        } as any,
        { transaction: t }
      );

      const ticket = await Tickets.create(
        {
          booking_id: booking.booking_id,
          quantity: Number(data.quantity),
          price_per_ticket: Number(data.price_per_ticket),
        } as any,
        { transaction: t }
      );

      await t.commit();

      return {
        bookingId: booking.booking_id,
        paymentId: payment.payment_id,
        ticketId: ticket.ticket_id,
      };
    } catch (error) {
      t.rollback();
      return error;
    }
  },

  async deleteBooking(id: string) {
    return await Bookings.destroy({
      where: {
        booking_id: id,
      },
    });
  },
};
