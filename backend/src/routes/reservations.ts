import { Router } from "express";
import {
  createReservation,
  deleteReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
} from "../controllers/reservationsController";
const router = Router();

router.get("/", getAllReservations);
router.get("/:id", getReservationById);
router.post("/", createReservation);
router.put("/:id", updateReservation);
router.delete("/:id", deleteReservation);

export default router;
