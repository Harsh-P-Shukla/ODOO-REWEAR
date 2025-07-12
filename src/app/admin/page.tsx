'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

const users = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@email.com', role: 'user', points: 450 },
  { id: '2', name: 'Mike Chen', email: 'mike@email.com', role: 'user', points: 320 },
  { id: '3', name: 'Emma Wilson', email: 'emma@email.com', role: 'admin', points: 1000 },
];

const orders = [
  { id: '1', item: 'Vintage Denim Jacket', user: 'Mike Chen', status: 'pending' },
  { id: '2', item: 'Gold Hoop Earrings', user: 'Sarah Johnson', status: 'approved' },
  { id: '3', item: 'Classic White Sneakers', user: 'Emma Wilson', status: 'rejected' },
];

const listings = [
  { id: '1', title: 'Vintage Denim Jacket', user: 'Sarah Johnson', status: 'approved' },
  { id: '2', title: 'Leather Crossbody Bag', user: 'Mike Chen', status: 'pending' },
  { id: '3', title: 'Gold Hoop Earrings', user: 'Emma Wilson', status: 'rejected' },
];

const statusMap: Record<string, { text: string; className: string }> = {
  approved: { text: 'Approved', className: 'badge-success' },
  pending: { text: 'Pending', className: 'badge-warning' },
  rejected: { text: 'Rejected', className: 'badge-error' },
};

export default function AdminPanel() {
  const [tab, setTab] = useState<'users' | 'orders' | 'listings'>('users');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage users, orders, and listings</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            className={`px-4 py-2 rounded-lg font-medium ${tab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            onClick={() => setTab('users')}
          >
            Users
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${tab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            onClick={() => setTab('orders')}
          >
            Orders
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium ${tab === 'listings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            onClick={() => setTab('listings')}
          >
            Listings
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {tab === 'users' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Users</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Points</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{user.name}</td>
                        <td className="py-2">{user.email}</td>
                        <td className="py-2 capitalize">{user.role}</td>
                        <td className="py-2">{user.points}</td>
                        <td className="py-2 space-x-2">
                          <button className="btn-danger text-xs">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'orders' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Orders (Swaps)</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Item</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{order.item}</td>
                        <td className="py-2">{order.user}</td>
                        <td className="py-2">
                          <span className={`badge ${statusMap[order.status].className}`}>{statusMap[order.status].text}</span>
                        </td>
                        <td className="py-2 space-x-2">
                          <button className="btn-primary text-xs">Approve</button>
                          <button className="btn-danger text-xs">Reject</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Listings</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2">Title</th>
                      <th className="py-2">User</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map(listing => (
                      <tr key={listing.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{listing.title}</td>
                        <td className="py-2">{listing.user}</td>
                        <td className="py-2">
                          <span className={`badge ${statusMap[listing.status].className}`}>{statusMap[listing.status].text}</span>
                        </td>
                        <td className="py-2 space-x-2">
                          <button className="btn-primary text-xs">Approve</button>
                          <button className="btn-danger text-xs">Reject</button>
                          <button className="btn-danger text-xs">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 