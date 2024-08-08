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

// 채팅방 Map
const rooms: Map<string, string[]> = new Map();

// 소켓 연결
io.on("connection", socket => {
	console.log("a user connected: ", socket.id);

	// room 전체에게 broadcast
	socket.on("message", ({ roomId, msg }) => {
		socket.to(roomId).emit("message", { roomId, msg });
	});

	// 채팅방 입장
	socket.on("join", roomId => {
		socket.join(roomId);
		console.log(`${socket.id} joined room: ${roomId}`);
		io.to(roomId).emit("message", {
			roomId,
			msg: `${socket.id} has joined the room.`,
		});
	});

	// 채팅방 나가기
	socket.on("leave", roomId => {
		socket.leave(roomId);
		rooms.delete(roomId);
		// io.emit("rooms", Array.from(rooms)); // Broadcast room list
	});

	// 연결 끊김
	socket.on("disconnect", () => {
		console.log("user disconnected");
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
