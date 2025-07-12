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

// Placeholder data
const items = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    image: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=400&fit=crop',
    points: 150,
    category: 'clothing',
    brand: 'Levi\'s',
    condition: 'vintage',
    location: 'New York, NY',
  },
  {
    id: '2',
    title: 'Leather Crossbody Bag',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop',
    points: 200,
    category: 'bags',
    brand: 'Coach',
    condition: 'gently_used',
    location: 'Los Angeles, CA',
  },
  {
    id: '3',
    title: 'Classic White Sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d114d2c9d?w=400&h=400&fit=crop',
    points: 180,
    category: 'shoes',
    brand: 'Nike',
    condition: 'like_new',
    location: 'Chicago, IL',
  },
  {
    id: '4',
    title: 'Silk Scarf Collection',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    points: 80,
    category: 'accessories',
    brand: 'Hermès',
    condition: 'new',
    location: 'Miami, FL',
  },
  {
    id: '5',
    title: 'Gold Chain Necklace',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop',
    points: 120,
    category: 'jewelry',
    brand: 'Cartier',
    condition: 'gently_used',
    location: 'San Francisco, CA',
  },
  {
    id: '6',
    title: 'Summer Dress',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    points: 90,
    category: 'clothing',
    brand: 'Zara',
    condition: 'like_new',
    location: 'Boston, MA',
  },
];

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesCondition = selectedCondition === 'all' || item.condition === selectedCondition;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCondition && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'points-low':
        return a.points - b.points;
      case 'points-high':
        return b.points - a.points;
      case 'newest':
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

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
              Showing {sortedItems.length} of {items.length} items
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
              {sortedItems.map((item, index) => (
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
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'space-y-3' : 'flex-1 space-y-2'}>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold text-lg">{item.points} points</span>
                      <span className="badge badge-info">{item.category}</span>
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
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn-primary w-full mt-4"
                    >
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Empty State */}
          {sortedItems.length === 0 && (
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