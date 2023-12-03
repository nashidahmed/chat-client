"use client";

import { SyntheticEvent, useEffect, useState } from "react";

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const [name, setName] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket>();

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", () => {
        setConnected(true);
        socket.send(name);
      });

      socket.addEventListener("message", (event) => {
        setMessages([...messages, event.data]);
      });

      return () => {
        socket.close();
      };
    }
  }, [socket]);

  const connect = (event: SyntheticEvent) => {
    event.preventDefault();
    console.log("Connected");
    setSocket(new WebSocket("ws://localhost:3000"));
  };

  const sendMessage = (event: SyntheticEvent) => {
    event.preventDefault();
    setMessages([...messages, message]);
    // if (socket) {
    //   socket.send("Hi")
    // }
  };

  return connected ? (
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
          {messages}
        </div>
      </form>

      <footer>&copy; WebSocket Client</footer>
    </main>
  ) : (
    <main className="container mx-auto flex max-h-screen min-h-screen flex-col p-8">
      <div className="mb-4 flex grow flex-col justify-end gap-2 overflow-y-scroll px-4">
        {messages.map((message) => (
          <div>{message}</div>
        ))}
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
            type="search"
            id="search"
            className="block w-full rounded-full border border-gray-600 bg-gray-700 p-4 text-sm text-white focus:border-blue-500 focus:ring-blue-500 dark:placeholder-gray-400"
            placeholder="Enter your message..."
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button
            type="submit"
            className="absolute bottom-2.5 end-2.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-800"
            onClick={(e) => sendMessage(e)}
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
