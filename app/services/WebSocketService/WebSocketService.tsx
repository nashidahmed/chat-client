import { createContext, useContext, useEffect, useState } from "react";

interface WebSocketService {
  send: (data: any) => void;
  sendMessage: (message: string) => void;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

const WebSocketContext = createContext<WebSocketService | undefined>(undefined);

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const [webSocket, setWebSocket] = useState<WebSocketService | undefined>(
    undefined,
  );

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.addEventListener("open", () => {
      console.log("WebSocket connected");
    });

    ws.addEventListener("close", () => {
      console.log("WebSocket disconnected");
    });

    setWebSocket({
      send: (data) => ws.send(JSON.stringify(data)),
      sendMessage: (message) => {
        // Customize this function based on your message format or protocol
        ws.send(JSON.stringify({ type: "message", content: message }));
      },
    });

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketService => {
  const context = useContext(WebSocketContext);

  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }

  return context;
};
