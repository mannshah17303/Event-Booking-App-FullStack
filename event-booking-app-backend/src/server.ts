import express from "express";
import cookieParser from "cookie-parser";
import { sequelize } from "./config/database";
import userRoutes from "./routes/user.routes";
import bookingRoutes from "./routes/booking_routes";
import contactRoutes from "./routes/contact_routes";
import ticketRoutes from "./routes/ticket_routes";
import favoriteRoutes from "./routes/favorite_routes";
import eventRoutes from "./routes/event_routes";
import paymentRoutes from "./routes/payment_routes";
import groupRoutes from "./routes/group_event_routes"
import helmet from "helmet";
import "./utils/emailSchedular";

import cors from "cors";

const app = express();

app.use(helmet())

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/contacts", contactRoutes);
app.use("/tickets", ticketRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/events", eventRoutes);
app.use("/payments", paymentRoutes);
app.use("/group", groupRoutes);

const PORT = process.env.PORT;

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start app:", err);
  }
};

start();
