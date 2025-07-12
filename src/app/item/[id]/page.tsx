'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  points: number;
}

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  size: string;
  condition: string;
  tags: string[];
  images: string[];
  points: number;
  status: string;
  brand: string;
  location: string;
  seller: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statusMap: Record<string, { text: string; className: string }> = {
  available: { text: 'Available', className: 'badge-success' },
  swapped: { text: 'Swapped', className: 'badge-info' },
  pending: { text: 'Pending', className: 'badge-warning' },
};

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${params.id}`);
        const data = await response.json();
        
        if (data.success) {
          setItem(data.data);
        } else {
          toast.error('Item not found');
          router.push('/browse');
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item');
        router.push('/browse');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    fetchItem();
  }, [params.id, router]);

  const handleSwapRequest = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setRequesting(true);
    try {
      const response = await fetch('/api/swap-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item?.id,
          message: 'I would like to swap for this item',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Swap request sent successfully!');
        setItem(prev => prev ? { ...prev, status: 'pending' } : null);
      } else {
        toast.error(data.error || 'Failed to send swap request');
      }
    } catch (error) {
      console.error('Swap request error:', error);
      toast.error('Failed to send swap request');
    } finally {
      setRequesting(false);
    }
  };

  const handleBuyItem = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!item) return;

    if (user.points < item.points) {
      toast.error(`You need ${item.points} points to buy this item. You currently have ${user.points} points.`);
      router.push('/credits');
      return;
    }

    const confirmPurchase = window.confirm(
      `Are you sure you want to buy "${item.title}" for ${item.points} points?`
    );

    if (!confirmPurchase) return;

    setRequesting(true);
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

      const data = await response.json();

      if (response.ok) {
        toast.success(`Item purchased successfully! ${item.points} points have been deducted from your account.`);
        setUser(prev => prev ? { ...prev, points: data.data.buyer.points } : null);
        setItem(prev => prev ? { ...prev, status: 'swapped' } : null);
      } else {
        toast.error(data.message || 'Failed to purchase item');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase item');
    } finally {
      setRequesting(false);
    }
  };

  const handleAddToCart = () => {
    if (!item) return;
    
    // Check if item is available before adding to cart
    if (item.status !== 'available') {
      toast.error(`${item.title} is no longer available`);
      return;
    }
    
    addToCart({
      id: item.id,
      title: item.title,
      description: item.description,
      images: item.images,
      points: item.points,
      category: item.category,
      type: item.type,
      size: item.size,
      condition: item.condition,
      seller: item.seller,
    });
    toast.success(`${item.title} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Item not found</h2>
          <Link href="/browse" className="btn-primary">
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

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
          <Link href="/browse" className="text-blue-600 hover:underline text-sm">← Back to Browse</Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Image Gallery */}
          <div>
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true }}
              className="rounded-lg overflow-hidden"
            >
              {item.images.map((img, idx) => (
                <SwiperSlide key={idx}>
                  <img src={img} alt={item.title} className="w-full h-80 object-cover" />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Item Details */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h1>
              <div className="flex items-center gap-2 mb-4">
                <span className={`badge ${statusMap[item.status].className}`}>{statusMap[item.status].text}</span>
                <span className="badge badge-info">{item.category}</span>
                <span className="badge badge-info">{item.type}</span>
                <span className="badge badge-info">Size: {item.size}</span>
                <span className="badge badge-info capitalize">{item.condition.replace('_', ' ')}</span>
              </div>
              <p className="text-gray-700 mb-4">{item.description}</p>
              <div className="mb-4">
                {item.tags.map(tag => (
                  <span key={tag} className="badge badge-info mr-2 mb-2">#{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{item.seller.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-gray-800 font-medium">{item.seller.name}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-blue-600">{item.points} points</span>
                {user && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Your balance:</span>
                    <span className={`font-semibold ${user.points >= item.points ? 'text-green-600' : 'text-red-600'}`}>
                      {user.points} points
                    </span>
                  </div>
                )}
              </div>
              
              {user ? (
                <div className="space-y-3">
                  <button
                    className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
                      user.points >= item.points && item.status === 'available'
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                    onClick={handleBuyItem}
                    disabled={requesting || item.status !== 'available' || user.points < item.points}
                  >
                    {requesting ? 'Processing Purchase...' : `Buy for ${item.points} Points`}
                  </button>
                  
                  <button
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300"
                    onClick={handleAddToCart}
                    disabled={requesting || item.status !== 'available'}
                  >
                    Add to Cart
                  </button>
                  
                  <button
                    className="w-full py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300"
                    onClick={handleSwapRequest}
                    disabled={requesting || item.status !== 'available'}
                  >
                    {requesting ? 'Requesting...' : 'Request Swap'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm">Please log in to interact with this item</p>
                  <Link href="/login" className="btn-primary w-full text-center">
                    Login to Continue
                  </Link>
                </div>
              )}
              
              {user && user.points < item.points && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    You need {item.points - user.points} more points to buy this item.
                    <Link href="/credits" className="text-blue-600 hover:underline ml-1">
                      Buy more credits
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 