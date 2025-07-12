export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  points: number;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  size: string;
  condition: 'new' | 'gently_used' | 'used' | 'vintage';
  tags: string[];
  images: string[];
  userId: string;
  status: 'available' | 'swapped' | 'pending';
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SwapRequest {
  _id: string;
  requesterId: string;
  itemId: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface SearchFilters {
  category?: string;
  type?: string;
  size?: string;
  condition?: string;
  minPoints?: number;
  maxPoints?: number;
} 