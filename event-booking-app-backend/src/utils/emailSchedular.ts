import cron from "node-cron";
import { mailService } from "../services/mail.service";
import { GroupEventMembers, GroupEvents, Users } from "../models";
import { Op } from "sequelize";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

async function getEventsForToday() {
  const ist = dayjs().tz("Asia/Kolkata");
  const start = ist.startOf("day").toDate();
  const end = ist.endOf("day").toDate();
  const todayEvents = await GroupEventMembers.findAll({
    include: [
      {
        model: GroupEvents,
        as: "groupEvent",
        where: {
          date: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
      },
      {
        model: Users,
        as: "user",
        attributes: ["email"],
      },
    ],
  });
  return todayEvents;
}

cron.schedule("* * * * *", async () => {
  const groupEventsHappeningToday = await getEventsForToday();
  for (const eventMember of groupEventsHappeningToday) {
    await mailService.sendMail(
        eventMember.user.email,
      `Reminder: Event ${eventMember.groupEvent.name} is today!`,
      `Hello! Just a reminder that the event ${eventMember.groupEvent.name} is scheduled for today at ${eventMember.groupEvent.location}.`
    );
  }
});
