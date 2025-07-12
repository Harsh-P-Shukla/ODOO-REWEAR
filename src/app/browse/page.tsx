'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  seller: {
    name: string;
    email: string;
  };
  createdAt: string;
  status: string; // Added status field
}

const categories = [
  { id: 'all', name: 'All Items', icon: '🛍️', color: 'from-gray-500 to-gray-600' },
  { id: 'clothing', name: 'Clothing', icon: '👕', color: 'from-blue-500 to-cyan-500' },
  { id: 'accessories', name: 'Accessories', icon: '👜', color: 'from-purple-500 to-pink-500' },
  { id: 'shoes', name: 'Shoes', icon: '👟', color: 'from-green-500 to-emerald-500' },
  { id: 'bags', name: 'Bags', icon: '🛍️', color: 'from-pink-500 to-rose-500' },
  { id: 'jewelry', name: 'Jewelry', icon: '💍', color: 'from-yellow-500 to-orange-500' },
];

const conditions = [
  { id: 'all', name: 'All Conditions' },
  { id: 'new', name: 'New' },
  { id: 'like_new', name: 'Like New' },
  { id: 'gently_used', name: 'Gently Used' },
  { id: 'used', name: 'Used' },
  { id: 'vintage', name: 'Vintage' },
];

export default function BrowsePage() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch items from API
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          category: selectedCategory,
          condition: selectedCondition,
          search: searchQuery,
          sortBy: sortBy === 'newest' ? 'createdAt' : 'points',
          sortOrder: sortBy === 'points-high' ? 'desc' : 'asc',
        });

        const response = await fetch(`/api/items/browse?${params}`);
        const data = await response.json();

        if (data.success) {
          setItems(data.data);
        } else {
          console.error('Failed to fetch items:', data.message);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedCategory, selectedCondition, searchQuery, sortBy]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading items...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Browse Items
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover amazing pieces from our community of fashion enthusiasts
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl border border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field w-full"
                  />
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="input-field"
                >
                  {conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="flex flex-wrap items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="points-low">Points: Low to High</option>
                  <option value="points-high">Points: High to Low</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">View:</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-3">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-white/80 text-gray-700 hover:bg-white shadow-md'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-6"
          >
            <p className="text-gray-600">
              Showing {items.length} items
            </p>
          </motion.div>

          {/* Items Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedCategory}-${selectedCondition}-${searchQuery}-${viewMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
              }
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={viewMode === 'grid' 
                    ? 'card p-6 h-full'
                    : 'card p-6 flex items-center space-x-4'
                  }
                >
                  <div className={viewMode === 'grid' 
                    ? 'aspect-square mb-4 overflow-hidden rounded-2xl'
                    : 'w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl'
                  }>
                    <img
                      src={item.images[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'space-y-3' : 'flex-1 space-y-2'}>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-600 font-bold">{item.points} points</span>
                      <div className="flex gap-2">
                        <span className="badge badge-info">{item.category}</span>
                        {item.status !== 'available' && (
                          <span className="badge badge-warning">Sold</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{item.brand}</span>
                      <span className="capitalize">{item.condition.replace('_', ' ')}</span>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="text-sm text-gray-500">
                        📍 {item.location}
                      </div>
                    )}
                    
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
                        className={`flex-1 text-sm ${
                          item.status === 'available' 
                            ? 'btn-primary' 
                            : 'bg-gray-400 text-white cursor-not-allowed'
                        }`}
                        disabled={item.status !== 'available'}
                      >
                        {item.status === 'available' ? 'Add to Cart' : 'Sold'}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {items.length === 0 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCondition('all');
                  setSearchQuery('');
                }}
                className="btn-primary"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 