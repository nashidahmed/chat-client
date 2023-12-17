import { createContext } from "react";

export interface WebSocketService {
  send: (data: any) => void;
}

const WebSocketContext = createContext<WebSocketService | undefined>(undefined);

export default WebSocketContext;
