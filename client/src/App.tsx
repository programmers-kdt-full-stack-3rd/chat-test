import { ChangeEvent, FC, FormEvent, useEffect, useState } from "react";

import "./App.css";
import { socket } from "./socket";

const App: FC = () => {
	// message state
	const [message, setMessage] = useState<string>("");
	const [messages, setMessages] = useState<string[]>([]);

	// message reception
	useEffect(() => {
		socket.on("other message", msg => {
			setMessages(prevMessages => [...prevMessages, msg]);
			window.scrollTo(0, document.body.scrollHeight);
		});

		return () => {
			socket.off("other message");
		};
	}, [socket]);

	// input change handler
	const onChange = (event: ChangeEvent<HTMLInputElement>) => {
		setMessage(event.target.value);
	};

	// form submit handler
	const onSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (message !== "") {
			// 메시지 송신(이벤트 발행)
			socket.emit("message", message);
			setMessage("");
			setMessages(prevMessages => [...prevMessages, message]);
		}
	};

	return (
		<>
			<ul className="messages">
				{messages.map((msg, index) => (
					<li key={index}>{msg}</li>
				))}
			</ul>
			<form
				action=""
				onSubmit={onSubmit}
			>
				<input
					autoComplete="off"
					value={message}
					onChange={onChange}
				/>
				<button>Send</button>
			</form>
		</>
	);
};

export default App;
