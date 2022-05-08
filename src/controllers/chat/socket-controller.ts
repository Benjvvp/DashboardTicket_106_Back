import { Socket } from "socket.io";

const SocketController = (io: any) => {
  io.on("connection", (socket: Socket) => {
    console.log("User connected");
  });
  io.on("disconnect", (socket: Socket) => {
    console.log("User disconnected");
  });
};
export default SocketController;
