"use client";

import { SyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Message {
  type: string;
  name?: string;
  value: string;
}

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", () => {
        console.log(new Date());
        setConnected(true);
        socket.send(name);
      });

      socket.addEventListener("message", (event) => {
        console.log(JSON.parse(event.data));
        setMessages((prevMessages) => [
          JSON.parse(event.data),
          ...prevMessages,
        ]);
      });

      socket.addEventListener("close", () => {
        console.log(new Date());
        disconnect("Disconnected from server due to inactivity.");
      });

      return () => {
        socket.close();
      };
    }
  }, [socket]);

  const connect = (event: SyntheticEvent) => {
    event.preventDefault();
    console.log("Connected");
    setSocket(new WebSocket(process.env.NEXT_PUBLIC_WS as string));
    setMessages((prevMessages) => [
      {
        type: "info",
        value: "You joined the chat",
      },
      ...prevMessages,
    ]);
  };

  const disconnect = (message: string) => {
    setConnected(false);
    toast.warn(message);
  };

  const sendMessage = (event: SyntheticEvent) => {
    event.preventDefault();
    console.log(messages);
    if (socket && socket.readyState == socket.OPEN) {
      const newMessage: Message = {
        type: "message",
        value: message,
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      socket.send(message);
      setMessage("");
    } else {
      disconnect("You were disconnected from the server. Please reconnect.");
    }
  };

  return !connected ? (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <header>
        <div className="text-3xl">WebSocket Chat Client</div>
      </header>

      <form>
        <div className="flex flex-col gap-4">
          <label
            htmlFor="first_name"
            className="mb-2 block text-sm font-medium text-white"
          >
            Enter your name
          </label>
          <input
            type="text"
            id="name"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 p-2.5 text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John"
            required
          />
          <button
            type="submit"
            onClick={(event) => connect(event)}
            className="text-whitehover:bg-blue-800 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 sm:w-auto"
          >
            Connect
          </button>
        </div>
      </form>

      <footer>&copy; WebSocket Client</footer>
    </main>
  ) : (
    <main className="container mx-auto flex h-screen flex-col p-8">
      <div className="mb-4 flex h-screen flex-col-reverse gap-2 overflow-y-auto px-4">
        {messages.map((message, index) =>
          message.type == "message" ? (
            <div
              className={`chat ${message.name ? "chat-start" : "chat-end"}`}
              key={index}
            >
              <div className="chat-header">
                {message.name ? message.name : "You"}
              </div>
              <div className="chat-bubble">{message.value}</div>
            </div>
          ) : (
            <div className="text-center" key={index}>
              {message.value}
            </div>
          ),
        )}
      </div>
      <form className="w-full">
        <label
          htmlFor="search"
          className="sr-only mb-2 text-sm font-medium text-white"
        >
          Send
        </label>
        <div className="relative w-full">
          <input
            id="search"
            className="block w-full rounded-full border border-gray-600 bg-gray-700 p-4 text-sm text-white focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400"
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            className="absolute bottom-2.5 end-2.5 inline-flex cursor-pointer justify-center rounded-full p-2 text-blue-600 hover:bg-blue-100 disabled:opacity-30 dark:text-blue-500 dark:hover:bg-gray-600"
            disabled={!message}
            onClick={(e) => sendMessage(e)}
          >
            <svg
              className="h-5 w-5 rotate-90 rtl:-rotate-90"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
            </svg>
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </main>
  );
}
