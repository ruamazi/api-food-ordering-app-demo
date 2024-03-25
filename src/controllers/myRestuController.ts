import { Request, Response } from "express";
import Restaurant from "../models/resturant";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

export const getMyRestu = async (req: Request, res: Response) => {
  try {
    const restu = await Restaurant.findOne({ user: req.userId });
    if (!restu) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.status(200).json(restu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to get restaurant" });
  }
};

export const createRestu = async (req: Request, res: Response) => {
  try {
    const existingRestu = await Restaurant.findOne({ user: req.userId });
    if (existingRestu) {
      return res
        .status(409)
        .json({ message: "User restaurant already exists" });
    }
    const imgUrl = await uploadImg(req.file as Express.Multer.File);

    const restu = new Restaurant(req.body);
    restu.imageUrl = imgUrl;
    restu.user = new mongoose.Types.ObjectId(req.userId);
    restu.lastUpdated = new Date();
    await restu.save();
    res.status(201).json(restu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create restaurant" });
  }
};

export const updateRestu = async (req: Request, res: Response) => {
  const {
    restaurantName,
    city,
    country,
    deliveryPrice,
    estimatedDeliveryTime,
    cuisines,
    menuItems,
  } = req.body;
  try {
    const restu = await Restaurant.findOne({ user: req.userId });
    if (!restu) {
      return res.status(404).json({ error: "Restaurant not found" });
    }
    restu.restaurantName = restaurantName;
    restu.city = city;
    restu.country = country;
    restu.deliveryPrice = deliveryPrice;
    restu.estimatedDeliveryTime = estimatedDeliveryTime;
    restu.cuisines = cuisines;
    restu.menuItems = menuItems;
    restu.lastUpdated = new Date();
    if (req.file) {
      const imgUrl = await uploadImg(req.file as Express.Multer.File);
      restu.imageUrl = imgUrl;
    }
    await restu.save();
    res.status(200).json(restu);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to update restaurant" });
  }
};

export const deleteRestu = async (req: Request, res: Response) => {
  res.json({ message: "Restu route ready" });
};

const uploadImg = async (file: Express.Multer.File) => {
  const image = file;
  const base64Img = Buffer.from(image.buffer).toString("base64");
  const dataUri = `data:${image.mimetype};base64,${base64Img}`;
  const uploadResp = await cloudinary.uploader.upload(dataUri);

  return uploadResp.url;
};
