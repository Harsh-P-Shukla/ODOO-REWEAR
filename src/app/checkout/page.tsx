'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import Navigation from '@/components/Navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
}

export default function CheckoutPage() {
  const { items, getTotalPoints, clearCart, removeFromCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please login to continue');
      router.push('/login');
      return;
    }

    const totalPoints = getTotalPoints();
    if (user.points < totalPoints) {
      const needed = totalPoints - user.points;
      toast.error(`You need ${needed} more points. Redirecting to credits page...`);
      setTimeout(() => router.push('/credits'), 2000);
      return;
    }

    setIsProcessing(true);

    try {
      const successfulPurchases = [];
      const failedPurchases = [];

      // Process each item purchase one by one
      for (const item of items) {
        try {
          const response = await fetch('/api/items/redeem', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              itemId: item.id,
            }),
          });

          const result = await response.json();

          if (result.success) {
            successfulPurchases.push(item);
            toast.success(`Purchased: ${item.title}`);
          } else {
            failedPurchases.push({ item, error: result.message });
            toast.error(`Failed to purchase ${item.title}: ${result.message}`);
          }
        } catch (error) {
          failedPurchases.push({ item, error: 'Network error' });
          toast.error(`Failed to purchase ${item.title}: Network error`);
        }
      }

      // Remove successful purchases from cart
      successfulPurchases.forEach(item => {
        removeFromCart(item.id);
      });

      // Show summary
      if (successfulPurchases.length > 0) {
        toast.success(`Successfully purchased ${successfulPurchases.length} items!`);
        if (failedPurchases.length > 0) {
          toast.error(`${failedPurchases.length} items failed to purchase. Check your cart.`);
        }
        router.push('/dashboard');
      } else {
        toast.error('No items were purchased. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to process purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
            <button
              onClick={() => router.push('/browse')}
              className="btn-primary"
            >
              Browse Items
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your items and complete your purchase</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.category} • {item.type}</p>
                      <p className="text-sm text-gray-500">Size: {item.size} • Condition: {item.condition}</p>
                      <p className="text-sm text-gray-500">Seller: {item.seller.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{item.points} points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Payment Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Items ({items.length})</span>
                  <span className="font-semibold">{getTotalPoints()} points</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (10%)</span>
                  <span className="font-semibold text-red-600">-{Math.floor(getTotalPoints() * 0.1)} points</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">{getTotalPoints()} points</span>
                </div>
              </div>

              {user && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Your Balance:</span>
                    <span className={`font-semibold ${user.points >= getTotalPoints() ? 'text-green-600' : 'text-red-600'}`}>
                      {user.points} points
                    </span>
                  </div>
                  {user.points < getTotalPoints() && (
                    <p className="text-sm text-red-600 mt-2">
                      You need {getTotalPoints() - user.points} more points
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={isProcessing || !user || user.points < getTotalPoints()}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                  user && user.points >= getTotalPoints() && !isProcessing
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Complete Purchase'}
              </button>

              {user && user.points < getTotalPoints() && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    Need more points? 
                    <button
                      onClick={() => router.push('/credits')}
                      className="text-blue-600 hover:underline ml-1"
                    >
                      Buy credits
                    </button>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 