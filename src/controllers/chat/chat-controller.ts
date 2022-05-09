import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Message from "../../database/models/Message";

export function getUnseenCountMessages(req: Request, res: Response) {
  try {
    //Get ids of users
    const { id } = req.params as { id: string };
    const usersID = id.split("-");
    const userId = usersID[0];
    const senderId = usersID[1];
    if (!userId || !senderId) {
      return res.status(400).json({
        message: "User id or sender id is not valid",
      });
    }
    const unseenMessagesCount = Message.find({
      $and: [
        { $or: [{ user: userId }, { sender: senderId }] },
        { seen: false },
      ],
    });
    return res
      .status(200)
      .json({ message: "Unseen messages found", unseenMessagesCount });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessagesInChat(req: Request, res: Response) {
  try {
    //Get ids of users
    console.log(req.body);
    const { userId, senderId } = req.body;
    const toReturn = req.query.toReturn as string;
    console.log(toReturn);

    if (!userId || !senderId) {
      return res.status(400).json({
        message: "User id or sender id is not valid",
      });
    }

    if (toReturn) {
      const messages = await Message.find({
        $and: [{ $or: [{ user: userId }, { sender: senderId }] }],
      })
        .sort({ createdAt: 1 })
        .limit(parseInt(toReturn));
      return res.status(200).json({ message: "Messages found", messages });
    }
    
    const messages = await Message.find({
      $and: [{ $or: [{ user: userId }, { sender: senderId }] }],
    }).sort({ createdAt: 1 });

    return res.status(200).json({ message: "Messages found", messages });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
