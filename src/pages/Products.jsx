import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // This would come from your API
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Mock data for now
            setProducts([
                {
                    id: 1,
                    name: 'Vatistsa 5L',
                    brand: 'vatistsa',
                    description: 'Everyday pure water for family use',
                    price: 99,
                    size: '5L',
                    stock: 500,
                    image: '/images/vatistsa-5l.jpg'
                },
                {
                    id: 2,
                    name: 'Vatistsa 10L',
                    brand: 'vatistsa',
                    description: 'Large bottle for home and office',
                    price: 189,
                    size: '10L',
                    stock: 300,
                    image: '/images/vatistsa-10l.jpg'
                },
                {
                    id: 3,
                    name: 'Vatistsa 20L',
                    brand: 'vatistsa',
                    description: 'Economical bulk size',
                    price: 349,
                    size: '20L',
                    stock: 200,
                    image: '/images/vatistsa-20l.jpg'
                },
                {
                    id: 4,
                    name: 'Le Blue 750ml',
                    brand: 'leblue',
                    description: 'Premium glass bottle',
                    price: 299,
                    size: '750ml',
                    stock: 100,
                    image: '/images/leblue-750ml.jpg'
                },
                {
                    id: 5,
                    name: 'Le Blue 1L',
                    brand: 'leblue',
                    description: 'Luxury edition',
                    price: 399,
                    size: '1L',
                    stock: 80,
                    image: '/images/leblue-1l.jpg'
                },
                {
                    id: 6,
                    name: 'Le Blue 1.5L',
                    brand: 'leblue',
                    description: 'Premium family size',
                    price: 549,
                    size: '1.5L',
                    stock: 50,
                    image: '/images/leblue-1.5l.jpg'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        filter === 'all' ? true : p.brand === filter
    );

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-4">
                            Our <span className="text-blue-600">Products</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Pure, sodium-free water for every need
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="py-8 border-b border-gray-200">
                <div className="container-custom">
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All Products
                        </button>
                        <button
                            onClick={() => setFilter('vatistsa')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === 'vatistsa'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                            }`}
                        >
                            Vatistsa
                        </button>
                        <button
                            onClick={() => setFilter('leblue')}
                            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                                filter === 'leblue'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                        >
                            Le Blue
                        </button>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-16">
                <div className="container-custom">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                                >
                                    <Link to={`/product/${product.id}`}>
                                        <div className={`h-48 ${
                                            product.brand === 'vatistsa' ? 'bg-amber-50' : 'bg-blue-50'
                                        } relative overflow-hidden`}>
                                            {/* Product image placeholder */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className={`w-24 h-24 rounded-full ${
                                                    product.brand === 'vatistsa' ? 'bg-amber-200' : 'bg-blue-200'
                                                } flex items-center justify-center`}>
                                                    <span className="text-3xl">💧</span>
                                                </div>
                                            </div>
                                            {/* Brand badge */}
                                            <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                                                product.brand === 'vatistsa'
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-blue-600 text-white'
                                            }`}>
                                                {product.brand === 'vatistsa' ? 'Vatistsa' : 'Le Blue'}
                                            </span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-medium text-gray-900 mb-2">
                                                {product.name}
                                            </h3>
                                            <p className="text-gray-500 text-sm mb-4">
                                                {product.description}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-2xl font-light text-gray-900">
                                                    ₨ {product.price}
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {product.size}
                                                </span>
                                            </div>
                                            <button className="mt-4 w-full py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                                View Details
                                            </button>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">100% Sodium Free</h3>
                            <p className="text-gray-500">Pure water for a healthy life</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Eco-Friendly Packaging</h3>
                            <p className="text-gray-500">Sustainable bottles for future</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Free Delivery</h3>
                            <p className="text-gray-500">On orders over ₨ 1000</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Products;