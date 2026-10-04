import React, { useEffect } from 'react';
import NotificationContent from './NotificationContent';

const WebSocketConnection = () => {
  const {user}= useSelector(state=>state)
  
    const [socket, setSocket] = useState(null);

    useEffect(() => {
      const newSocket = new WebSocket(`wss://newstag-api.decomans.com/ws/notifications/${user.location}/${user.site}/`);
      setSocket(newSocket);
  
      return () => {
        newSocket.close();
      };
    }, []);
  
    useEffect(() => {
      if (!socket) return;
  
      socket.onopen = () => {
        console.log('WebSocket connected');
      };
  
      socket.onmessage = (event) => {
        console.log('Message from server:', event.data);
        // Handle incoming messages from the server
      };
  
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
  
      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };
  
      // Cleanup function
      return () => {
        socket.close();
      };
    }, [socket]);
  
    // Example function to send a message
    const sendMessage = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send('Hello, WebSocket server!');
      }
    };
  return (
    <div>
      <NotificationContent/>
    </div>
  );
};

export default WebSocketConnection;
