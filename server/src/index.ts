import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

/**
 * server 설정
 */
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:5173",
	},
});

/**
 * socket 세팅
 */

// 소켓 연결
io.on("connection", socket => {
	console.log("a user connected");

	// message 수신
	socket.on("message", data => {
		socket.broadcast.emit("other message", data);
	});

	// 연결 끊김
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
