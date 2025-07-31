import { Router } from "express";
import { bookingController } from "../controllers/booking.controller";
import { checkToken } from "../middlewares/token.middleware";
const router = Router();

router.post("/create-payment-intent", checkToken, bookingController.createPaymentIntent)
router.post("/addBooking", checkToken, bookingController.addBooking)
router.get("/getAllBookingDetailsForPieChart", bookingController.getAllBookingDetailsForPieChart);
router.get("/getBookingsOfLoggedInUser", bookingController.getBookingsOfLoggedInUser);
router.get("/getBookedEventDetailsByEventId", bookingController.getBookedEventDetailsByEventId);
router.post("/updateRatings", checkToken, bookingController.updateBookingRatings)
router.delete("/delete/:id", checkToken, bookingController.deleteBooking)
router.get("/averageRatings", bookingController.averageRatings)

//searching, sorting, pagination
router.get("/search-sort-pagination", bookingController.searchedSortPaginateBookings)

export default router;