import { Router } from "express";
import { groupController } from "../controllers/group.event.controller";

const router = Router();

router.post("/addMember", groupController.addGroupEventMembers)
router.delete("/removeMember", groupController.removeGroupEventMembers)
router.get("/members", groupController.getAllGroupEventMembers);
router.get("/calculateMembers", groupController.calculateMembers);
router.get("/", groupController.getAllGroupEvents);
router.get("/getGroupEventDetailsByGroupId", groupController.getGroupEventDetailsByGroupId);

export default router;