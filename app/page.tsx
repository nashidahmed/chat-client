"use client"

import { SyntheticEvent, useEffect, useState } from "react"

export default function Home() {
  const [connected, setConnected] = useState<boolean>(false)
  const [messages, setMessages] = useState<string[]>([])
  const [name, setName] = useState<string>("")
  const [socket, setSocket] = useState<WebSocket>()

  useEffect(() => {
    if (socket) {
      socket.addEventListener("open", () => {
        setConnected(true)
        socket.send(name)
      })

      socket.addEventListener("message", (event) => {
        setMessages([...messages, event.data])
      })

      return () => {
        socket.close()
      }
    }
  }, [socket])

  const connect = (event: SyntheticEvent) => {
    event.preventDefault()
    console.log("Connected")
    setSocket(new WebSocket("ws://localhost:3000"))
  }

  const sendMessage = async () => {
    if (socket) {
      socket.send("Hi")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {!connected ? (
        <>
          <header>
            <div className="text-3xl">WebSocket Chat Client</div>
          </header>

          <form>
            <div className="flex flex-col gap-4">
              <label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-white"
              >
                Enter your name
              </label>
              <input
                type="text"
                id="name"
                className="border border-gray-300 text-sm rounded-lg block w-full p-2.5 bg-gray-700 dark:border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => setName(e.target.value)}
                placeholder="John"
                required
              />
              <button
                type="submit"
                onClick={(event) => connect(event)}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Connect
              </button>
              <button
                type="button"
                onClick={sendMessage}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Send
              </button>
              {messages}
            </div>
          </form>

          <footer>&copy; WebSocket Client</footer>
        </>
      ) : (
        <>{/* Chat code here */}</>
      )}
    </main>
  )
}
