import express, { Request, Response } from "express";
import "dotenv/config";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import connectDb from "./connectDb";
import myUserRoutes from "./routes/myUserRoutes";
import myResturantRoutes from "./routes/myResturantRoutes";
import resturantRoutes from "./routes/restaurantRoute";
import orderRoute from "./routes/orderRoute";

const port = process.env.PORT || 3030;
const app = express();
app.use(cors());

//stripe needs to access to row data from req
app.use("/api/order/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.json());

app.use("/api/user", myUserRoutes);
app.use("/api/my/restu", myResturantRoutes);
app.use("/api/restu", resturantRoutes);
app.use("/api/order", orderRoute);

app.get("/api", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to backend API" });
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.listen(port, async () => {
  try {
    await connectDb();
    console.log(`Server started on: http://localhost:${port}/api`);
  } catch (err) {
    console.log(err);
  }
});
