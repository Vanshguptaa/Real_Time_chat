import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('http://localhost:5000');

function App() {
  const [name, setName] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('chatHistory', history => setChat(history));

    socket.on('receiveMessage', msg => {
      setChat(prev => [...prev, { ...msg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    });

    socket.on('userTyping', username => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(''), 2000);
    });

    socket.on('userList', users => setOnlineUsers(users));

    return () => socket.off();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const handleLogin = () => {
    if (name.trim()) {
      socket.emit('login', name.trim());
      setLoggedIn(true);
    }
  };

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('sendMessage', {
        name,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('typing', name);
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter') handleSend();
  };

  const getInitial = (userName) => userName?.charAt(0).toUpperCase();

  return (
    <div className="container">
      {!loggedIn ? (
        <div className="login-box">
          <h2>👋 Welcome to Lia+ Chat</h2>
          <p>Enter your name to get started</p>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <button onClick={handleLogin}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-box">
          <div className="user-list">
            <h3>Online Users</h3>
            <ul>
              {onlineUsers.map((user, idx) => (
                <li key={idx}>{user}</li>
              ))}
            </ul>
          </div>

          <div className="chat-section">
            <div className="chat-header">
              <div className="title">Lia+ Chat</div>
              <div className="logged-in-user">You: <strong>{name}</strong></div>
            </div>

            <div className="messages">
              {chat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message-bubble ${msg.name === name ? 'my' : 'other'}`}
                >
                  <div className="avatar">{getInitial(msg.name)}</div>
                  <div className="bubble-content">
                    <div className="sender">
                      {msg.name === name ? 'You' : msg.name}
                      <span className="time">{msg.timestamp}</span>
                    </div>
                    <div className="text">{msg.message}</div>
                  </div>
                </div>
              ))}
              {typingUser && <div className="typing">{typingUser} is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                type="text"
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                onKeyUp={handleTyping}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
