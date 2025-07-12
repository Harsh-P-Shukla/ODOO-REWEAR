'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Link from 'next/link';

const itemData = {
  id: '1',
  title: 'Vintage Denim Jacket',
  description: 'A classic vintage denim jacket in excellent condition. Perfect for layering and adding a retro touch to any outfit.',
  category: 'clothing',
  type: 'Jacket',
  size: 'M',
  condition: 'gently_used',
  tags: ['vintage', 'denim', 'casual'],
  images: [
    'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop',
  ],
  points: 150,
  status: 'available',
  uploader: {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
  },
};

const statusMap: Record<string, { text: string; className: string }> = {
  available: { text: 'Available', className: 'badge-success' },
  swapped: { text: 'Swapped', className: 'badge-info' },
  pending: { text: 'Pending', className: 'badge-warning' },
};

export default function ItemDetailPage() {
  const params = useParams();
  const [requesting, setRequesting] = useState(false);

  // Placeholder: In real app, fetch item by params.id
  const item = itemData;

  const handleSwapRequest = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      alert('Swap request sent!');
    }, 1200);
  };

  const handleRedeem = () => {
    setRequesting(true);
    setTimeout(() => {
      setRequesting(false);
      alert('Redeemed via points!');
    }, 1200);
  };

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
                <img src={item.uploader.avatar} alt={item.uploader.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="text-gray-800 font-medium">{item.uploader.name}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-2xl font-bold text-blue-600">{item.points} points</span>
              </div>
              <div className="flex gap-4">
                <button
                  className="btn-primary flex-1"
                  onClick={handleSwapRequest}
                  disabled={requesting || item.status !== 'available'}
                >
                  {requesting ? 'Requesting...' : 'Swap Request'}
                </button>
                <button
                  className="btn-secondary flex-1"
                  onClick={handleRedeem}
                  disabled={requesting || item.status !== 'available'}
                >
                  {requesting ? 'Processing...' : 'Redeem via Points'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 