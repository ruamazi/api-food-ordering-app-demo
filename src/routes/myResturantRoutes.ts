import { Router } from "express";
import {
  createRestu,
  deleteRestu,
  getMyRestu,
  updateRestu,
} from "../controllers/myRestuController";
import multer from "multer";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateRestuRequest } from "../middleware/validation";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

router.get("/", jwtCheck, jwtParse, getMyRestu);
router.post(
  "/",
  upload.single("imageFile"),
  validateRestuRequest,
  jwtCheck,
  jwtParse,
  createRestu
);
router.put(
  "/",
  upload.single("imageFile"),
  validateRestuRequest,
  jwtCheck,
  jwtParse,
  updateRestu
);
router.delete("/", deleteRestu);

export default router;
