import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/resturant";
import Order from "../models/order";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);
const frontUrl = process.env.FRONTEND_URL as string;
const stripeHookSec = process.env.STRIPE_WEBHOOK_SECRET as string;

type CheckOutSessionRequestT = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

export const getMyOrders = async (req: Request, res: Response) => {
  res.json({ message: "working fine ook" });
};

export const stripeWebHookHandler = async (req: Request, res: Response) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      stripeHookSec
    );
  } catch (error: any) {
    console.log(error);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const order = await Order.findById(event.data.object.metadata?.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.totalAmount = event.data.object.amount_total;
    order.status = "paid";
    await order.save();
  }
  res.status(200).send();
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const checkOutSessionRequest: CheckOutSessionRequestT = req.body;
  try {
    const restaurant = await Restaurant.findById(
      checkOutSessionRequest.restaurantId
    );
    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkOutSessionRequest.deliveryDetails,
      cartItems: checkOutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkOutSessionRequest,
      restaurant.menuItems
    );

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );
    if (!session.url) {
      return res.status(404).json({ error: "Failed to create stripe session" });
    }
    await newOrder.save();
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await stripe.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "usd",
          },
        },
      },
    ],
    mode: "payment",
    metadata: { orderId, restaurantId },
    success_url: `${frontUrl}/order-status?success=true`,
    cancel_url: `${frontUrl}/detail/${restaurantId}?cancelled=true`,
  });
  return sessionData;
};

const createLineItems = (
  checkOutSessionRequest: CheckOutSessionRequestT,
  menuItems: MenuItemType[]
) => {
  const lineItems = checkOutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }
    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "usd",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };
    return line_item;
  });
  return lineItems;
};
