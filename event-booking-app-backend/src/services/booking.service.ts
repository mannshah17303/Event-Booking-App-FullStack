import { bookingRepository } from "../repositories/booking.repository";

export const bookingService = {
  
  async addBooking(data: {user_id:string, event_id:number, booking_date:string, quantity:number, price_per_ticket:number, paymentIntentId:string}) {
    const booking = await bookingRepository.addBooking(data);
    return booking;
  },
  async createPaymentIntent(data: {user_id:string, event_id:number, booking_date:string, quantity:number, price_per_ticket:number}) {
    const booking = await bookingRepository.createPaymentIntent(data);
    return booking;
  },
  async getAllBookingDetailsForPieChart() {
    return await bookingRepository.getAllBookingDetailsForPieChart();
  },
  async updateBookingRatings(currentUserId:string, ratingId:number, ratingStar:number){
    return await bookingRepository.updateBookingRatings(currentUserId, ratingId, ratingStar)
  },
  async deleteBooking(id:string){
    return await bookingRepository.deleteBooking(id);
  }
};
