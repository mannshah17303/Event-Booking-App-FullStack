import { Request, Response } from "express";
import { GroupEventMembers, GroupEvents } from "../models";
import { sendResponse } from "../utils/sendResponse";
import { Op } from "sequelize";

export const groupController = {
  async getAllGroupEvents(req: Request, res: Response) {
    try {
      const today = new Date().toISOString().split("T")[0]
      const groupEvents = await GroupEvents.findAll({
        where:{
          date:{
            [Op.gte]: today
          }
        }
      });
      sendResponse(res, 200, "data fetched successful", groupEvents);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async getAllGroupEventMembers(req: Request, res: Response) {
    try {
      const groupEventMembers = await GroupEventMembers.findAll();
      sendResponse(res, 200, "data fetched successful", groupEventMembers);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async calculateMembers(req: Request, res: Response) {
    try {
      const groupId = Number(req.query.groupId);
      const groupEventMembers = await GroupEventMembers.findAll({
        where: {
          group_id: groupId,
        },
      });
      sendResponse(res, 200, "data fetched successful", groupEventMembers);
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async getGroupEventDetailsByGroupId(req: Request, res: Response) {
    try {
      const groupId = Number(req.query.groupId);
      const groupEventDetailByEventId = await GroupEvents.findOne({
        where: {
          group_id: groupId,
        },
      });
      sendResponse(
        res,
        200,
        "group event fetched successful",
        groupEventDetailByEventId
      );
    } catch (error: any) {
      sendResponse(res, 500, error.message, null);
    }
  },

  async addGroupEventMembers(req: Request, res: Response) {
    try {
      const { groupId, userId } = req.body;
      const addMemberIntoGroupEvent = await GroupEventMembers.create({
        group_id: groupId,
        user_id: userId,
      } as any);
      sendResponse(
        res,
        201,
        "booking inserted successful",
        addMemberIntoGroupEvent
      );
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },
  async removeGroupEventMembers(req: Request, res: Response) {
    try {
      const { groupId, userId } = req.body;
      const removeMemberFromGroupEvent = await GroupEventMembers.destroy({
        where: {
          group_id: groupId,
          user_id: userId,
        },
      });
      sendResponse(
        res,
        201,
        "member removed successful",
        removeMemberFromGroupEvent
      );
    } catch (error: any) {
      sendResponse(res, 400, error.message, null);
    }
  },
};
