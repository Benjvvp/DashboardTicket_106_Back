import { Socket } from "socket.io";
import Message from "../../database/models/Message";

const SocketController = (io: any) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected");

    socket.on(
      "chatSubmitMessage",
      (data: { message: string; userId: string; senderId: string }) => {
        //Save message in DB
        const message = new Message({
          user: data.userId,
          sender: data.senderId,
          message: data.message,
        });
        message.save().then(() => {
          //Send message to userId
          io.to(data.userId).emit("chatMessage", {
            message: data.message,
            userId: data.userId,
            senderId: data.senderId,
          });
        });
      }
    );
  });
  io.on("disconnect", (socket: Socket) => {
    console.log("User disconnected");
  });
};
export default SocketController;
