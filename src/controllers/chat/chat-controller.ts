import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import Message from "../../database/models/Message";
export default function getUnseenCountMessages(res: Response, req: Request) {
      try{
            //Get ids of users
            const { id } = req.params as { id: string };
            const usersID = id.split("-");
            const userId = usersID[0];
            const senderId = usersID[1];
            const unseenMessagesCount = Message.find({
                  $and: [
                        { $or: [{ user: userId }, { sender: senderId }] },
                        { seen: false }
                  ]

            });
            return res.status(200).json({ message: "Unseen messages found", unseenMessagesCount });
      } catch {
            return res.status(500).json({ message: "Internal server error" });
      }
}
