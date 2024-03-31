import { Router } from "express";
import { jwtCheck, jwtParse } from "../middleware/auth";
import {
  createCheckoutSession,
  getMyOrders,
  getMyRestaurantOrders,
  stripeWebHookHandler,
} from "../controllers/orderController";

const router = Router();

router.get("/", jwtCheck, jwtParse, getMyOrders);
router.get("/my-restu-orders", jwtCheck, jwtParse, getMyRestaurantOrders);
router.post(
  "/checkout/create-checkout-session",
  jwtCheck,
  jwtParse,
  createCheckoutSession
);
router.post("/checkout/webhook", stripeWebHookHandler);

export default router;
