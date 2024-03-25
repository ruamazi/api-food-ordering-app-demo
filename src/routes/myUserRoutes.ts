import { Router } from "express";
import { createUser, getUser, updateUser } from "../controllers/userController";
import { jwtCheck, jwtParse } from "../middleware/auth";
import { validateUserRequest } from "../middleware/validation";

const router = Router();

router.get("/", jwtCheck, jwtParse, getUser);
router.post("/", jwtCheck, createUser);
router.put("/", jwtCheck, jwtParse, validateUserRequest, updateUser);

export default router;
