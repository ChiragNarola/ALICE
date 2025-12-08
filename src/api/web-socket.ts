export function connectStaffWebSocket(onMessage: (data: any) => void) {
  const ws = new WebSocket(`ws://127.0.0.1:8000/ws`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  ws.onerror = () => console.warn("WebSocket Error");
  ws.onclose = () => console.warn("WebSocket Closed");
}