'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

// Placeholder data
const userData = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  points: 450,
  role: 'user',
};

const myListings = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=300&h=300&fit=crop',
    points: 150,
    status: 'available',
    category: 'clothing',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Leather Crossbody Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=300&fit=crop',
    points: 200,
    status: 'pending',
    category: 'bags',
    createdAt: '2024-01-10',
  },
  {
    id: '3',
    title: 'Classic White Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d114d2c9d?w=300&h=300&fit=crop',
    points: 180,
    status: 'swapped',
    category: 'shoes',
    createdAt: '2024-01-05',
  },
];

const myPurchases = [
  {
    id: '1',
    title: 'Silk Scarf Collection',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop',
    points: 80,
    status: 'completed',
    seller: 'Emma Wilson',
    completedAt: '2024-01-12',
  },
  {
    id: '2',
    title: 'Vintage Sunglasses',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop',
    points: 120,
    status: 'pending',
    seller: 'Mike Chen',
    requestedAt: '2024-01-18',
  },
];

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
  const [activeTab, setActiveTab] = useState<'listings' | 'purchases'>('listings');

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
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
              <p className="text-gray-600">{userData.email}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{userData.points}</div>
              <div className="text-sm text-gray-500">Points Balance</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
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
          <div className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors duration-200">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Earn Points</div>
            <div className="text-sm opacity-90">Complete swaps</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
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
            </nav>
          </div>

          <div className="p-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myListings.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      className="card overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-blue-600 font-bold">{item.points} points</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{item.category}</span>
                          <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-3 flex space-x-2">
                          <Link
                            href={`/item/${item.id}`}
                            className="btn-secondary text-xs flex-1 text-center"
                          >
                            View Details
                          </Link>
                          <button className="btn-danger text-xs flex-1">
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">My Purchases & Swaps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myPurchases.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -2 }}
                      className="card overflow-hidden"
                    >
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-blue-600 font-bold">{item.points} points</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          <div>Seller: {item.seller}</div>
                          <div>
                            {item.status === 'completed' ? 'Completed' : 'Requested'}: {
                              new Date(item.completedAt || item.requestedAt).toLocaleDateString()
                            }
                          </div>
                        </div>
                        <div className="mt-3">
                          <Link
                            href={`/item/${item.id}`}
                            className="btn-secondary text-xs w-full text-center block"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 