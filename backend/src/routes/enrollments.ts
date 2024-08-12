import { Router } from "express";
import {
  createEnrollment,
  deleteEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
} from "../controllers/enrollmentsController";

const router = Router();

router.get("/", getAllEnrollments);
router.get("/:id", getEnrollmentById);
router.post("/", createEnrollment);
router.put("/:id", updateEnrollment);
router.delete("/:id", deleteEnrollment);

export default router;
