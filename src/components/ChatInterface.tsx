import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Send, User, ArrowLeft } from 'lucide-react';

const ChatInterface: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const { chatThreads, sendMessage, getThreadMessages, getCurrentUserThreads, getOrCreateThread } = useChat();
  const [message, setMessage] = useState('');
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threads = getCurrentUserThreads();

  // Load admin user for chat
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{"id":"admin","name":"Admin","isAdmin":true}');

  useEffect(() => {
    // Auto-select the first thread if available and none is selected
    if (threads.length > 0 && !activeThread) {
      setActiveThread(threads[0].id);
      setSelectedUserId(isAdmin ? threads[0].userId : threads[0].adminId);
    }
  }, [threads, activeThread, isAdmin]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeThread, getThreadMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !currentUser) return;
    
    if (isAdmin && selectedUserId) {
      sendMessage(message, selectedUserId);
    } else {
      sendMessage(message, adminUser.id);
    }
    
    setMessage('');
  };

  const handleSelectThread = (threadId: string, userId: string, adminId: string) => {
    setActiveThread(threadId);
    setSelectedUserId(isAdmin ? userId : adminId);
  };

  const handleStartNewChat = () => {
    if (!currentUser || isAdmin) return;
    
    // Create or get thread with admin
    const thread = getOrCreateThread(currentUser.id, adminUser.id);
    setActiveThread(thread.id);
    setSelectedUserId(adminUser.id);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const activeMessages = activeThread ? getThreadMessages(activeThread) : [];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[calc(100vh-13rem)]">
      <div className="flex h-full">
        {/* Thread list (sidebar) */}
        <div className="w-full sm:w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
          </div>
          
          {!isAdmin && (
            <div className="p-3">
              <button
                onClick={handleStartNewChat}
                className="w-full flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                <Send size={16} className="mr-2" />
                Chat with Admin
              </button>
            </div>
          )}
          
          <div className="divide-y divide-gray-200">
            {threads.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              threads.map((thread) => {
                const threadMessages = getThreadMessages(thread.id);
                const lastMessage = threadMessages[threadMessages.length - 1];
                const otherUserId = isAdmin ? thread.userId : thread.adminId;
                const otherUserName = isAdmin 
                  ? `User ${thread.userId}`
                  : adminUser.name;
                
                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread.id, thread.userId, thread.adminId)}
                    className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                      activeThread === thread.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">{otherUserName}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(thread.lastMessageTimestamp)}
                        </div>
                      </div>
                    </div>
                    {lastMessage && (
                      <div className="pl-9">
                        <div className="text-sm text-gray-600 truncate">
                          {lastMessage.text}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatTime(lastMessage.timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Chat area */}
        <div className="hidden sm:flex flex-col flex-1">
          {activeThread ? (
            <>
              {/* Chat header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="sm:hidden mr-2">
                  <button
                    onClick={() => setActiveThread(null)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <ArrowLeft size={20} />
                  </button>
                </div>
                <div className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {isAdmin 
                      ? `User ${selectedUserId}`
                      : adminUser.name
                    }
                  </div>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Send size={24} className="mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser?.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-teal-600 text-white rounded-tr-none'
                                : 'bg-gray-200 text-gray-800 rounded-tl-none'
                            }`}
                          >
                            <div className="text-sm">{msg.text}</div>
                            <div
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-teal-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <div className="border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded-r-md hover:bg-teal-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 text-gray-500">
              <div className="text-center">
                <Send size={32} className="mx-auto mb-2" />
                <p>Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile chat view */}
        <div className={`absolute inset-0 bg-white sm:hidden ${activeThread ? 'block' : 'hidden'}`}>
          {activeThread && (
            <>
              {/* Mobile chat header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <button
                  onClick={() => setActiveThread(null)}
                  className="p-1 rounded-full hover:bg-gray-100 mr-2"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="bg-teal-100 text-teal-800 p-2 rounded-full mr-3">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-medium text-gray-800">
                    {isAdmin 
                      ? `User ${selectedUserId}`
                      : adminUser.name
                    }
                  </div>
                </div>
              </div>
              
              {/* Mobile messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50" style={{ height: 'calc(100% - 130px)' }}>
                {activeMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Send size={24} className="mb-2" />
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMessages.map((msg) => {
                      const isCurrentUser = msg.senderId === currentUser?.id;
                      
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-teal-600 text-white rounded-tr-none'
                                : 'bg-gray-200 text-gray-800 rounded-tl-none'
                            }`}
                          >
                            <div className="text-sm">{msg.text}</div>
                            <div
                              className={`text-xs mt-1 ${
                                isCurrentUser ? 'text-teal-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Mobile message input */}
              <div className="border-t border-gray-200 p-4 absolute bottom-0 left-0 right-0 bg-white">
                <form onSubmit={handleSendMessage} className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-4 py-2 rounded-r-md hover:bg-teal-700 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;