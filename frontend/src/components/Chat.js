import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, ArrowLeft, Users } from 'lucide-react';
import io from 'socket.io-client';

const Chat = ({ userRole, userId }) => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Socket.io connection
    socketRef.current = io('http://localhost:5000');

    // Listen for incoming messages
    socketRef.current.on('receive-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      fetchChats(); // Refresh chat list to update last message
    });

    fetchChats();
    if (userRole === 'patient') {
      fetchDoctors();
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Join/leave chat room when selectedChat changes
  useEffect(() => {
    if (socketRef.current && selectedChat) {
      socketRef.current.emit('join-chat', selectedChat._id);

      return () => {
        if (socketRef.current && selectedChat) {
          socketRef.current.emit('leave-chat', selectedChat._id);
        }
      };
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/my-chats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/patient/care-team', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chat/messages/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSelectedChat(data);
        setShowChatList(false);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChatWithDoctor = async (doctorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/get-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: userId,
          doctorId: doctorId,
        }),
      });

      if (response.ok) {
        const chat = await response.json();
        setSelectedChat(chat);
        setMessages(chat.messages || []);
        setShowDoctorList(false);
        setShowChatList(false);
        fetchChats(); // Refresh chat list
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage;
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: messageText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const lastMessage = data.chat.messages[data.chat.messages.length - 1];

        // Update local messages immediately
        setMessages(data.chat.messages);

        // Emit the message to other users in the chat via Socket.io
        if (socketRef.current) {
          socketRef.current.emit('send-message', {
            chatId: selectedChat._id,
            message: lastMessage
          });
        }

        // Update the chat list to reflect the new last message time
        fetchChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText); // Restore message on error
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getChatPartnerName = (chat) => {
    return userRole === 'patient' ? chat.doctorName : chat.patientName;
  };

  if (showDoctorList) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => {
                setShowDoctorList(false);
                setShowChatList(true);
              }}
              className="mr-3 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold">Start New Chat</h2>
          </div>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No doctors available</p>
            <p className="text-sm mt-2">Book an appointment first to chat with a doctor</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{doctor.specialty}</p>
                  </div>
                  <button
                    onClick={() => startChatWithDoctor(doctor._id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (showChatList) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <MessageCircle className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-bold">My Chats</h2>
          </div>
          {userRole === 'patient' && (
            <button
              onClick={() => {
                setShowChatList(false);
                setShowDoctorList(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              New Chat
            </button>
          )}
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No chats yet</p>
            <p className="text-sm mt-2">
              {userRole === 'patient'
                ? 'Click "New Chat" to start a conversation with a doctor'
                : 'Patients will initiate chats with you'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => fetchMessages(chat._id)}
                className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getChatPartnerName(chat)}
                    </h3>
                    {chat.messages.length > 0 && (
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {chat.messages[chat.messages.length - 1].message}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(chat.lastMessage)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {chat.messages.length} message{chat.messages.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center">
        <button
          onClick={() => {
            setShowChatList(true);
            setSelectedChat(null);
            setMessages([]);
          }}
          className="mr-3 hover:bg-gray-100 p-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h3 className="font-semibold text-lg">
            {getChatPartnerName(selectedChat)}
          </h3>
          <p className="text-xs text-gray-500">
            {userRole === 'patient' ? 'Doctor' : 'Patient'}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No messages yet</p>
            <p className="text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === userId;
            return (
              <div
                key={index}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {isOwnMessage ? 'You' : msg.senderName}
                  </p>
                  <p className="break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
