export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  userId: string;
  adminId: string;
  messages: string[];
  lastMessageTimestamp: string;
}

export type CategoryColors = {
  [key: string]: string;
};