import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import Message from "../../database/models/Message";
import User from "../../database/models/User";

const SocketController = (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected");

    socket.on(
      "chatSubmitMessage",
      async (data: { message: string; userId: string; senderId: string }) => {
        //Save message in DB
        const message = await new Message({
          user: data.userId,
          sender: data.senderId,
          message: data.message,
        });
        message.save().then(() => {
          io.to([data.userId, data.senderId]).emit("newMessage", {
            message: data.message,
            user: data.userId,
            sender: data.senderId,
            createdAt: new Date(message.createdAt) as Date,
            seen: new Boolean(message.seen) as boolean,
          });
        });
      }
    );
    socket.on("join", (data: { userId: string }) => {
      socket.join(data.userId);
    });
    socket.on("leave", (data: { userId: string }) => {
      socket.leave(data.userId);
    });
    socket.on("chatSeen", (data: { userId: string; senderId: string }) => {
      const { userId, senderId } = data;
      Message.find({
        $and: [{ user: userId }, { sender: senderId }],
      }).then((messages) => {
        messages.forEach((message) => {
          message.seen = true;
          message.save();
        });
        socket.emit("chatSeen");
      });
    });
    socket.on(
      "loadMessages",
      async (data: { userId: string; senderId: string }) => {
        const { userId, senderId } = data;
        //Get messages from DB
        const messages = await Message.find({
          $and: [
            { $or: [{ user: userId }, { user: senderId }] },
            { $or: [{ sender: userId }, { sender: senderId }] },
          ],
        }).sort({ createdAt: 1 });
        //Send messages to users
        io.to([data.userId, data.senderId]).emit("loadMessages", {
          messages,
          userId: data.userId,
          senderId: data.senderId,
        });
      }
    );
    socket.on("getUsersListInChat", async (data: { userId: string }) => {
      const { userId } = data;
      //Get users from DB
      const users = await User.find();

      //Create users list
      const usersList = users.map(async (user) => {
        //Get last message from DB
        const lastMessage = await Message.findOne({
          $and: [
            { $or: [{ user: userId }, { user: user._id }] },
            { $or: [{ sender: userId }, { sender: user._id }] },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(1);

        //Get messages without viewed messages only your messages
        const unseenMessagesCount = await Message.find({
          $and: [
            { $and: [{ user: userId }, { sender: user._id }] },
            { seen: false },
          ],
        });

        const isOnlyUser = io.sockets.adapter.rooms[user._id];

        return {
          _id: user._id,
          userName: user.userName,
          avatar: user.avatar,
          isOnline: isOnlyUser,
          lastMessage: lastMessage ? lastMessage.message : "",
          lastMessageTime: lastMessage ? lastMessage.createdAt : "",
          unseenMessagesCount: unseenMessagesCount
            ? unseenMessagesCount.length
            : 0,
        };
      });
      //Send users list to users
      Promise.all(usersList).then((usersList) => {
        io.to([data.userId]).emit("getUsersListInChat", {
          usersList,
          userId: data.userId,
        });
      });
    });
  });
  io.on("disconnect", (socket: Socket) => {
    console.log("User disconnected");
  });
};
export default SocketController;
