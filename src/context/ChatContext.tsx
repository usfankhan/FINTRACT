import React, { createContext, useState, useContext, useEffect } from 'react';
import { Message, ChatThread, User } from '../types';
import { useAuth } from './AuthContext';

interface ChatContextType {
  messages: Message[];
  chatThreads: ChatThread[];
  sendMessage: (text: string, receiverId: string) => void;
  getThreadMessages: (threadId: string) => Message[];
  getCurrentUserThreads: () => ChatThread[];
  getOrCreateThread: (userId: string, adminId: string) => ChatThread;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  chatThreads: [],
  sendMessage: () => {},
  getThreadMessages: () => [],
  getCurrentUserThreads: () => [],
  getOrCreateThread: () => ({ id: '', userId: '', adminId: '', messages: [], lastMessageTimestamp: '' }),
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Load messages from localStorage
    const storedMessages = localStorage.getItem('messages');
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }

    // Load chat threads from localStorage
    const storedThreads = localStorage.getItem('chatThreads');
    if (storedThreads) {
      setChatThreads(JSON.parse(storedThreads));
    }

    if (!storedMessages && !storedThreads && currentUser) {
      // Create demo data
      const adminUser: User = JSON.parse(localStorage.getItem('adminUser') || '{"id":"admin","name":"Admin","isAdmin":true}');
      
      const demoMessages: Message[] = [
        {
          id: '1',
          senderId: adminUser.id,
          receiverId: '1',
          text: 'Welcome to the expense tracker! How can I help you today?',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          read: true,
        },
        {
          id: '2',
          senderId: '1',
          receiverId: adminUser.id,
          text: 'Hi, I need help with categorizing my expenses.',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          read: true,
        }
      ];

      const demoThread: ChatThread = {
        id: 'thread1',
        userId: '1',
        adminId: adminUser.id,
        messages: ['1', '2'],
        lastMessageTimestamp: demoMessages[1].timestamp,
      };

      localStorage.setItem('messages', JSON.stringify(demoMessages));
      localStorage.setItem('chatThreads', JSON.stringify([demoThread]));
      
      setMessages(demoMessages);
      setChatThreads([demoThread]);
    }
  }, [currentUser]);

  const saveMessagesAndThreads = (updatedMessages: Message[], updatedThreads: ChatThread[]) => {
    localStorage.setItem('messages', JSON.stringify(updatedMessages));
    localStorage.setItem('chatThreads', JSON.stringify(updatedThreads));
    setMessages(updatedMessages);
    setChatThreads(updatedThreads);
  };

  const sendMessage = (text: string, receiverId: string) => {
    if (!currentUser) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Update or create thread
    let thread = chatThreads.find(
      t => (t.userId === currentUser.id && t.adminId === receiverId) || 
           (t.adminId === currentUser.id && t.userId === receiverId)
    );

    const updatedMessages = [...messages, newMessage];

    if (thread) {
      // Update existing thread
      thread = {
        ...thread,
        messages: [...thread.messages, newMessage.id],
        lastMessageTimestamp: newMessage.timestamp,
      };
      
      const updatedThreads = chatThreads.map(t => 
        t.id === thread?.id ? thread : t
      );
      
      saveMessagesAndThreads(updatedMessages, updatedThreads);
    } else {
      // Create new thread
      const newThread: ChatThread = {
        id: Math.random().toString(36).substring(2, 9),
        userId: currentUser.isAdmin ? receiverId : currentUser.id,
        adminId: currentUser.isAdmin ? currentUser.id : receiverId,
        messages: [newMessage.id],
        lastMessageTimestamp: newMessage.timestamp,
      };
      
      const updatedThreads = [...chatThreads, newThread];
      saveMessagesAndThreads(updatedMessages, updatedThreads);
    }
  };

  const getThreadMessages = (threadId: string): Message[] => {
    const thread = chatThreads.find(t => t.id === threadId);
    if (!thread) return [];
    
    return messages.filter(message => thread.messages.includes(message.id))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const getCurrentUserThreads = (): ChatThread[] => {
    if (!currentUser) return [];
    
    return chatThreads
      .filter(thread => 
        currentUser.isAdmin ? true : thread.userId === currentUser.id
      )
      .sort((a, b) => 
        new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime()
      );
  };

  const getOrCreateThread = (userId: string, adminId: string): ChatThread => {
    // Find existing thread
    const existingThread = chatThreads.find(
      t => t.userId === userId && t.adminId === adminId
    );
    
    if (existingThread) return existingThread;
    
    // Create new thread
    const newThread: ChatThread = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      adminId,
      messages: [],
      lastMessageTimestamp: new Date().toISOString(),
    };
    
    const updatedThreads = [...chatThreads, newThread];
    localStorage.setItem('chatThreads', JSON.stringify(updatedThreads));
    setChatThreads(updatedThreads);
    
    return newThread;
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        chatThreads,
        sendMessage,
        getThreadMessages,
        getCurrentUserThreads,
        getOrCreateThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);