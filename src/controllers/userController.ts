import { Request, Response } from "express";
import User from "../models/user";

export const getUser = async (req: Request, res: Response) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(currentUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error getting user" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { auth0Id } = req.body;
  try {
    const userExists = await User.findOne({ auth0Id });
    if (userExists) {
      return res.status(200).send();
    }
    const newUser = new User(req.body);
    await newUser.save();
    return res.status(201).json(newUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { name, addressLine1, country, city } = req.body;
  const { userId } = req;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;
    await user.save();
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.json({ message: "Error updating user" });
  }
};
