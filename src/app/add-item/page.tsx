'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Navigation from '@/components/Navigation';

const categories = [
  { id: 'clothing', name: 'Clothing' },
  { id: 'accessories', name: 'Accessories' },
  { id: 'shoes', name: 'Shoes' },
  { id: 'bags', name: 'Bags' },
  { id: 'jewelry', name: 'Jewelry' },
];

const conditions = [
  { id: 'new', name: 'New' },
  { id: 'gently_used', name: 'Gently Used' },
  { id: 'used', name: 'Used' },
  { id: 'vintage', name: 'Vintage' },
];

export default function AddItemPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    size: '',
    condition: '',
    tags: '',
    points: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.category || !formData.type || !formData.size || !formData.condition || !formData.points) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          points: parseInt(formData.points),
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          images,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Item added successfully!');
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Failed to add item');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Item</h1>
          <p className="text-gray-600">Share your clothing with the community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Images (Max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Choose Images
                </button>
                <p className="mt-2 text-sm text-gray-500">
                  Drag and drop images here, or click to select
                </p>
              </div>
              
              {/* Image Preview */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="input-field"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Vintage Denim Jacket"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                className="input-field"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your item in detail..."
              />
            </div>

            {/* Category and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="input-field"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <input
                  id="type"
                  name="type"
                  type="text"
                  required
                  className="input-field"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="e.g., Jacket, Shirt, Dress"
                />
              </div>
            </div>

            {/* Size and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                  Size *
                </label>
                <input
                  id="size"
                  name="size"
                  type="text"
                  required
                  className="input-field"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g., M, L, XL, 10, 42"
                />
              </div>
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  Condition *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  className="input-field"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  <option value="">Select Condition</option>
                  {conditions.map(condition => (
                    <option key={condition.id} value={condition.id}>
                      {condition.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                id="tags"
                name="tags"
                type="text"
                className="input-field"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., vintage, denim, casual (comma separated)"
              />
            </div>

            {/* Points */}
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">
                Points *
              </label>
              <input
                id="points"
                name="points"
                type="number"
                min="1"
                required
                className="input-field"
                value={formData.points}
                onChange={handleInputChange}
                placeholder="e.g., 150"
              />
              <p className="mt-1 text-sm text-gray-500">
                Set the number of points required to swap this item
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Adding Item...' : 'Add Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 