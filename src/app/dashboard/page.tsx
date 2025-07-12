'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  points: number;
  role: string;
  stats?: {
    itemsListed: number;
    itemsSwapped: number;
    totalSwaps: number;
    rating: number;
    reviews: number;
  };
  level?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface Item {
  id: string;
  title: string;
  image: string;
  points: number;
  status: string;
  category: string;
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    available: { class: 'badge-success', text: 'Available' },
    pending: { class: 'badge-warning', text: 'Pending' },
    swapped: { class: 'badge-info', text: 'Swapped' },
    completed: { class: 'badge-success', text: 'Completed' },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || { class: 'badge-info', text: status };
  return <span className={`badge ${config.class}`}>{config.text}</span>;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [myListings, setMyListings] = useState<Item[]>([]);
  const [myPurchases, setMyPurchases] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'purchases' | 'transactions'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Check authentication
        const authResponse = await fetch('/api/auth/me');
        if (!authResponse.ok) {
          router.push('/login');
          return;
        }

        const authData = await authResponse.json();
        setUser(authData.user);

        // Fetch user profile with recent data
        const profileResponse = await fetch('/api/users/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setMyListings(profileData.recentItems || []);
          setMyPurchases(profileData.recentSwapRequests || []);
        }

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/credits/transactions?limit=5');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData.transactions || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your items and track your swaps</p>
        </motion.div>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.level && (
                <p className="text-sm text-blue-600 font-medium">{user.level} Level</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{user.points}</div>
              <div className="text-sm text-gray-500">Points Balance</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {user.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-blue-600">{user.stats.itemsListed}</div>
              <div className="text-sm text-gray-500">Items Listed</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-green-600">{user.stats.itemsSwapped}</div>
              <div className="text-sm text-gray-500">Items Swapped</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-purple-600">{user.stats.totalSwaps}</div>
              <div className="text-sm text-gray-500">Total Swaps</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-2xl font-bold text-yellow-600">{user.stats.rating.toFixed(1)}</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Link
            href="/add-item"
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold">List New Item</div>
            <div className="text-sm opacity-90">Add clothing to swap</div>
          </Link>
          <Link
            href="/browse"
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold">Browse Items</div>
            <div className="text-sm opacity-90">Find new pieces</div>
          </Link>
          <Link
            href="/credits"
            className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-semibold">Buy Credits</div>
            <div className="text-sm opacity-90">Get more points</div>
          </Link>
          <Link
            href="/profile"
            className="bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-lg text-center transition-colors duration-200"
          >
            <div className="text-2xl mb-2">👤</div>
            <div className="font-semibold">Edit Profile</div>
            <div className="text-sm opacity-90">Update your info</div>
          </Link>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Listings ({myListings.length})
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Purchases ({myPurchases.length})
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'transactions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Transactions ({transactions.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Recent Transactions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.type === 'deduction' ? '-' : '+'}{transaction.amount} points
                          </p>
                          <span className={`badge ${transaction.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No recent transactions</p>
                    )}
                  </div>
                </div>

                {/* Recent Listings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Listings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myListings.slice(0, 3).map((item) => (
                      <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                        <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.points} points</p>
                        {getStatusBadge(item.status)}
                      </div>
                    ))}
                    {myListings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No listings yet</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'listings' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Listings</h3>
                  <Link
                    href="/add-item"
                    className="btn-primary text-sm"
                  >
                    Add New Item
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myListings.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.points} points</p>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                  {myListings.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No listings yet. Start by adding your first item!</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'purchases' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Purchases</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myPurchases.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <img src={item.image} alt={item.title} className="w-full h-32 object-cover rounded-lg mb-3" />
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.points} points</p>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                  {myPurchases.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No purchases yet. Start browsing items!</p>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${transaction.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                          {transaction.type === 'deduction' ? '-' : '+'}{transaction.amount} points
                        </p>
                        <span className={`badge ${transaction.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No transactions yet</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 