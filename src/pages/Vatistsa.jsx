import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Vatistsa = () => {
    const products = [
        { size: '5L', price: 99, description: 'Perfect for small families' },
        { size: '10L', price: 189, description: 'Ideal for home and office' },
        { size: '20L', price: 349, description: 'Best value for large families' }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gradient-to-br from-amber-50 to-amber-100/50">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h1 className="text-5xl md:text-6xl font-light text-amber-900 mb-4">
                                Vatistsa
                            </h1>
                            <p className="text-xl text-amber-700 mb-6">
                                Everyday Purity for Everyone
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Our Vatistsa range delivers pure, sodium-free water for daily hydration needs. 
                                Economical without compromise, perfect for homes, offices, and businesses.
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    to="/contact"
                                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                                >
                                    Order Now
                                </Link>
                                <Link
                                    to="/products"
                                    className="px-8 py-3 border-2 border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
                                >
                                    View Products
                                </Link>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="relative h-96 bg-amber-200/30 rounded-3xl flex items-center justify-center">
                                <div className="w-48 h-96 bg-gradient-to-b from-amber-300/50 to-amber-500/50 rounded-full blur-3xl"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-8xl">💧</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Products Section */}
            <section className="py-20">
                <div className="container-custom">
                    <h2 className="text-3xl font-light text-gray-900 text-center mb-12">
                        Available Sizes
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {products.map((product, index) => (
                            <motion.div
                                key={product.size}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-2xl shadow-lg p-8 border border-amber-100 hover:shadow-xl transition-shadow"
                            >
                                <h3 className="text-2xl font-medium text-amber-900 mb-2">
                                    {product.size}
                                </h3>
                                <p className="text-gray-500 mb-4">{product.description}</p>
                                <div className="text-3xl font-light text-amber-600 mb-6">
                                    ₨ {product.price}
                                </div>
                                <button className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                                    Add to Cart
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-amber-50">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 bg-amber-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">💧</span>
                            </div>
                            <h3 className="font-medium text-amber-900 mb-2">Sodium Free</h3>
                            <p className="text-amber-700">100% pure hydration</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 bg-amber-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🏭</span>
                            </div>
                            <h3 className="font-medium text-amber-900 mb-2">Local Production</h3>
                            <p className="text-amber-700">Made in Jhelum</p>
                        </div>
                        <div>
                            <div className="w-16 h-16 mx-auto mb-4 bg-amber-200 rounded-full flex items-center justify-center">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <h3 className="font-medium text-amber-900 mb-2">Free Delivery</h3>
                            <p className="text-amber-700">On bulk orders</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Vatistsa;