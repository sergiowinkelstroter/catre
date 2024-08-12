import { Router } from "express";
import {
  createFacility,
  deleteFacility,
  getAllFacilities,
  getFacilityById,
  updateFacility,
} from "../controllers/facilitiesController";
const router = Router();

router.get("/", getAllFacilities);
router.get("/:id", getFacilityById);
router.post("/", createFacility);
router.put("/:id", updateFacility);
router.delete("/:id", deleteFacility);

export default router;
