import express from "express";
import userRoutes from "./routes/users";
import eventsRoutes from "./routes/events";
import enrollmentsRoutes from "./routes/enrollments";
import reservationsRoutes from "./routes/reservations";
import facilitiesRoutes from "./routes/facilities";
import router_login from "./routes/login";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 4002;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

app.use("/auth", router_login);

app.use("/users", userRoutes);
app.use("/events", eventsRoutes);
app.use("/enrollments", enrollmentsRoutes);
app.use("/reservations", reservationsRoutes);
app.use("/facilities", facilitiesRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
