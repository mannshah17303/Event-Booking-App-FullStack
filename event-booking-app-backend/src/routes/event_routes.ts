import { eventController } from "../controllers/event.controller";
import { Router } from "express";

const router = Router();


router.get("/", eventController.getAllEvents);
router.get("/getEventDetailsByEventId", eventController.getEventDetailsByEventId);

//searching, sorting, pagination
router.get("/search-sort-pagination", eventController.searchedSortPaginateEvent)

export default router;