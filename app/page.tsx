"use client";

import Image from "next/image";
import { SyntheticEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "@/public/icons/spinner.svg";
import SendMessageIcon from "@/public/icons/send_message.svg";

interface Message {
  type: string;
  name?: string;
  value: string;
  timestamp?: string;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", () => {
        handleSocketOpen();
      });

      socket.addEventListener("message", (event) => {
        console.log(JSON.parse(event.data));
        setMessages((prevMessages) => [
          JSON.parse(event.data),
          ...prevMessages,
        ]);
      });

      socket.addEventListener("close", () => {
        handleSocketClose();
      });

      return () => {
        socket.close();
      };
    }
  }, [socket]);

  const handleSocketOpen = () => {
    if (socket) {
      setConnected(true);
      setLoading(false);
      const timestamp = getCurrentTime();
      socket.send(name);
    }
  };

  const handleSocketClose = () => {
    if (socket) {
      disconnect("Disconnected from server due to inactivity.");
      setMessages((prevMessages) => [
        {
          type: "info",
          value: "You left the chat",
        },
        ...prevMessages,
      ]);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const connect = (event: SyntheticEvent) => {
    event.preventDefault();

    setLoading(true);
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

    if (socket && socket.readyState == socket.OPEN) {
      const timestamp = getCurrentTime();
      const newMessage: Message = {
        type: "message",
        timestamp,
        value: message,
      };
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      socket.send(JSON.stringify({ msg: message, timestamp }));
      setMessage("");
    } else {
      disconnect("You were disconnected from the server. Please reconnect.");
    }
  };

  return !connected ? (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <header>
        <div className="text-3xl">WebSocket Chat</div>
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
            className="text-whitehover:bg-blue-800 w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-600 sm:w-auto"
            disabled={loading}
          >
            {loading ? (
              <div className="flex flex-row items-center justify-center gap-2">
                Connecting
                <Spinner className="h-6 w-6 animate-spin fill-white text-gray-200 dark:text-gray-600" />
              </div>
            ) : (
              "Connect"
            )}
          </button>
        </div>
      </form>

      <footer>&copy; WebSocket Chat</footer>
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
                <time className="ms-1 text-xs opacity-50">
                  {message.timestamp}
                </time>
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
            id="send-message"
            className="block w-full rounded-full border border-gray-600 bg-gray-700 p-4 pr-12 text-sm text-white focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400"
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
            <SendMessageIcon className="h-5 w-5 rotate-90" />
            <span className="sr-only">Send message</span>
          </button>
        </div>
      </form>
    </main>
  );
}
