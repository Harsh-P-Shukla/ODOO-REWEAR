'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import Navigation from '@/components/Navigation';
import { useCart } from '@/contexts/CartContext';
import toast from 'react-hot-toast';

interface Item {
  id: string;
  title: string;
  description: string;
  images: string[];
  points: number;
  category: string;
  type: string;
  size: string;
  condition: string;
  brand: string;
  location: string;
  status: string;
  seller: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const categories = [
  { id: 'clothing', name: 'Clothing', icon: '👕', color: 'from-blue-500 to-cyan-500' },
  { id: 'accessories', name: 'Accessories', icon: '👜', color: 'from-purple-500 to-pink-500' },
  { id: 'shoes', name: 'Shoes', icon: '👟', color: 'from-green-500 to-emerald-500' },
  { id: 'bags', name: 'Bags', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
  { id: 'jewelry', name: 'Jewelry', icon: '💍', color: 'from-yellow-500 to-orange-500' },
];

export default function HomePage() {
  const { addToCart } = useCart();
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await fetch('/api/items/browse?limit=8');
        const data = await response.json();
        
        if (data.success) {
          setFeaturedItems(data.data);
        }
      } catch (error) {
        console.error('Error fetching featured items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  const handleAddToCart = (item: Item) => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              ReWear
              <span className="block text-4xl md:text-5xl text-blue-600">Community Clothing Exchange</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join our sustainable fashion community. Swap, share, and discover amazing pieces while earning points for your contributions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-lg px-8 py-4"
                >
                  Browse Items
                </motion.button>
              </Link>
              <Link href="/add-item">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary text-lg px-8 py-4"
                >
                  Add Your Item
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Items</h2>
            <p className="text-xl text-gray-600">Discover amazing pieces from our community</p>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="card p-4 h-full"
                >
                  <div className="aspect-square mb-4 overflow-hidden rounded-2xl">
                    <img
                      src={item.images[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-600 font-bold">{item.points} points</span>
                    <span className="badge badge-info">{item.category}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{item.brand}</span>
                    <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/item/${item.id}`}
                      className="flex-1 btn-secondary text-center text-sm"
                    >
                      View
                    </Link>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 btn-primary text-sm"
                    >
                      Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && featuredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items available yet</h3>
              <p className="text-gray-600 mb-6">Be the first to add an item to our community!</p>
              <Link href="/add-item">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary"
                >
                  Add Your First Item
                </motion.button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={`/browse?category=${category.id}`}>
                  <div className={`bg-gradient-to-br ${category.color} p-6 rounded-2xl text-center text-white shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Join our sustainable fashion community in three simple steps</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📱',
                title: 'Add Your Items',
                description: 'Upload photos and details of items you want to share with the community.',
              },
              {
                icon: '🔄',
                title: 'Earn Points',
                description: 'Get points for every item you add. Use points to claim items from others.',
              },
              {
                icon: '🛍️',
                title: 'Discover & Claim',
                description: 'Browse through community items and claim what you love using your points.',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-6xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Join?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Start sharing and discovering amazing fashion pieces today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary bg-white text-blue-600 hover:bg-gray-100"
                >
                  Get Started
                </motion.button>
              </Link>
              <Link href="/browse">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600"
                >
                  Browse Items
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 