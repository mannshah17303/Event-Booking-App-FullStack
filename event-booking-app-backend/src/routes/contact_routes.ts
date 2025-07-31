import { contactController } from "../controllers/contact.controller";
import { Router } from "express";
const router = Router();


router.post("/addContact", contactController.addContact)
router.get("/", contactController.getAllContacts);

export default router;