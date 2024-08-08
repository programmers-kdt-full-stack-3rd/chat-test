import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";

import "./App.css";
import { socket } from "./socket";

const App: FC = () => {
	// chat state
	const [chat, setChat] = useState<{
		rooms: {
			id: string;
			messages: string[];
		}[];
		roomId: string;
		message: string;
	}>({
		rooms: [],
		roomId: "",
		message: "",
	});
	const [search, setSearch] = useState<string>("");

	useEffect(() => {
		const handleMessage = ({
			roomId,
			msg,
			test,
		}: {
			roomId: string;
			msg: string;
			test: string;
		}) => {
			setChat(prevChat => {
				console.log(test);
				return {
					...prevChat,
					rooms: prevChat.rooms.map(room =>
						room.id === roomId
							? {
									...room,
									messages: [...room.messages, msg],
								}
							: room,
					),
				};
			});
		};

		socket.on("message", handleMessage);

		return () => {
			socket.off("message", handleMessage);
		};
	}, []);

	// 채팅방 입장
	const onJoinSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (search !== "") {
			const isRoom = chat.rooms.find(room => room.id === search);

			if (!isRoom) {
				socket.emit("join", search);
				setChat({
					rooms: [
						...chat.rooms,
						{
							id: search,
							messages: [],
						},
					],
					roomId: search,
					message: "",
				});
			} else {
				setChat({
					rooms: [...chat.rooms],
					roomId: search,
					message: "",
				});
			}

			setSearch("");
		}
	};

	// 채팅방 클릭 입장
	const onJoinClick = (roomId: string) => () => {
		setChat({
			...chat,
			roomId,
		});
	};

	// 메시지 전송
	const onMessageSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (chat.message !== "") {
			socket.emit("message", { roomId: chat.roomId, msg: chat.message });
			setChat({
				...chat,
				rooms: chat.rooms.map(room =>
					room.id === chat.roomId
						? {
								...room,
								messages: [...room.messages, chat.message],
							}
						: room,
				),
				message: "",
			});
		}
	};

	// input change handler
	const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value);
	};

	const onMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (chat !== null) {
			setChat({
				...chat,
				message: event.target.value,
			});
		}
	};

	return (
		<div className="container">
			<div className="room-container">
				<form onSubmit={onJoinSubmit}>
					<input
						autoComplete="off"
						value={search}
						onChange={onSearchChange}
						placeholder="Enter room ID"
					/>
					<button>Join</button>
				</form>
				<ul className="rooms">
					{chat.rooms.map((room, index) => (
						<li
							key={index}
							onClick={onJoinClick(room.id)}
						>
							방 id: {room.id}
							<br />
							마지막 chat: {room.messages[room.messages.length - 1]}
						</li>
					))}
				</ul>
			</div>
			<div className="chat-container">
				{chat.roomId === "" ? (
					<p>채팅방에 입장해주세요.</p>
				) : (
					<>
						<ul className="messages">
							{chat.rooms
								.find(room => room.id === chat.roomId)
								?.messages.map((msg, index) => <li key={index}>{msg}</li>)}
						</ul>
						<form onSubmit={onMessageSubmit}>
							<input
								autoComplete="off"
								value={chat.message}
								name="message"
								onChange={onMessageChange}
								placeholder="Type your message"
							/>
							<button>Send</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
};

export default App;
