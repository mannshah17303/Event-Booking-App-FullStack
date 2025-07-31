import { ticketController } from "../controllers/ticket.controller";
import { Router } from "express";
import { checkToken } from "../middlewares/token.middleware";
const router = Router();


router.post("/addTicket", checkToken, ticketController.addTicket)
router.get("/", ticketController.getAllTickets);

export default router;