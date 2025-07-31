import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

router.get("/getPaymentDetailsForLineChart", paymentController.getPaymentDetails);

export default router;
