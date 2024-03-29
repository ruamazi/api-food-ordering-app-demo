import { Router } from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import {
  createCheckoutSession,
  getMyOrders,
  stripeWebHookHandler,
} from "../controllers/orderController";

const router = Router();

router.get("/", jwtCheck, jwtParse, getMyOrders);
router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  createCheckoutSession
);
router.post("/checkout/webhook", stripeWebHookHandler);

export default router;
