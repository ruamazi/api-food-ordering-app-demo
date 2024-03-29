import { Router } from "express";
import { param } from "express-validator";
import { getRestuById, searchRestu } from "../controllers/restaurantController";

const router = Router();

router.get(
  "/search/:city",
  param("city")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("City parameter must be a valid string"),
  searchRestu
);
router.get(
  "/:restaurantId",
  param("restaurantId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("id parameter must be a valid string"),
  getRestuById
);

export default router;
