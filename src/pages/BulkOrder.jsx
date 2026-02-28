import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkOrder = () => {
    const [formData, setFormData] = useState({
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        productType: 'vatistsa',
        quantity: '',
        deliveryAddress: '',
        preferredDate: '',
        message: ''
    });

    const [loading, setLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await axios.post(`${API_URL}/bulk-order/submit`, formData);

        if (response.data.success) {
            toast.success('Bulk order inquiry submitted successfully! We\'ll contact you within 24 hours.');
            setFormData({
                companyName: '',
                contactPerson: '',
                email: '',
                phone: '',
                productType: 'vatistsa',
                quantity: '',
                deliveryAddress: '',
                preferredDate: '',
                message: ''
            });
        }
    } catch (error) {
        console.error('Bulk order error:', error);
        toast.error(error.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const bulkPricing = [
        {
            brand: 'Vatistsa',
            tiers: [
                { quantity: '100-500 bottles', price: '₨ 85/L', discount: '15% off' },
                { quantity: '500-1000 bottles', price: '₨ 75/L', discount: '25% off' },
                { quantity: '1000+ bottles', price: '₨ 65/L', discount: '35% off' }
            ],
            color: 'amber'
        },
        {
            brand: 'Le Blue',
            tiers: [
                { quantity: '50-200 bottles', price: '₨ 250/L', discount: '15% off' },
                { quantity: '200-500 bottles', price: '₨ 220/L', discount: '25% off' },
                { quantity: '500+ bottles', price: '₨ 190/L', discount: '35% off' }
            ],
            color: 'blue'
        }
    ];

    const benefits = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: 'Wholesale Pricing',
            description: 'Get the best rates for bulk orders'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
            ),
            title: 'Priority Delivery',
            description: 'Fast-tracked shipping for bulk customers'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l14-7 7 7z" />
                </svg>
            ),
            title: 'Custom Branding',
            description: 'Add your logo for events (min. 500 bottles)'
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: 'Dedicated Account Manager',
            description: 'Personal support for your business'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-blue-900 to-blue-800 text-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-light mb-6">
                            Bulk <span className="text-blue-300">Orders</span>
                        </h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Perfect for offices, restaurants, hotels, and events. Get special pricing for large quantities.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                                <span className="text-2xl font-light">📦</span>
                                <span className="ml-2">Min. Order: 50 bottles</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                                <span className="text-2xl font-light">🚚</span>
                                <span className="ml-2">Free Delivery</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-20">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-light text-gray-900 mb-4">
                            Why Choose Bulk <span className="text-blue-600">Ordering?</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Benefits designed for businesses and organizations
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{benefit.title}</h3>
                                <p className="text-gray-500 text-sm">{benefit.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Tiers */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl font-light text-gray-900 mb-4">
                            Bulk <span className="text-blue-600">Pricing</span>
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Better prices for larger orders
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {bulkPricing.map((brand, index) => (
                            <motion.div
                                key={brand.brand}
                                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2 }}
                                viewport={{ once: true }}
                                className={`bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 ${
                                    brand.color === 'amber' ? 'border-amber-500' : 'border-blue-500'
                                }`}
                            >
                                <div className={`p-6 ${
                                    brand.color === 'amber' ? 'bg-amber-50' : 'bg-blue-50'
                                }`}>
                                    <h3 className={`text-2xl font-light ${
                                        brand.color === 'amber' ? 'text-amber-900' : 'text-blue-900'
                                    }`}>
                                        {brand.brand}
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    {brand.tiers.map((tier, i) => (
                                        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                            <div>
                                                <span className="font-medium text-gray-900">{tier.quantity}</span>
                                                <p className="text-xs text-green-600 mt-1">{tier.discount}</p>
                                            </div>
                                            <span className={`text-xl font-light ${
                                                brand.color === 'amber' ? 'text-amber-600' : 'text-blue-600'
                                            }`}>
                                                {tier.price}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bulk Order Form */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12"
                        >
                            <h2 className="text-4xl font-light text-gray-900 mb-4">
                                Request a <span className="text-blue-600">Quote</span>
                            </h2>
                            <p className="text-gray-500">
                                Fill out the form below and our team will get back to you within 24 hours
                            </p>
                        </motion.div>

                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            onSubmit={handleSubmit}
                            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                        >
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Your Company Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Person *
                                    </label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+92 300 1234567"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Product Type *
                                    </label>
                                    <select
                                        name="productType"
                                        value={formData.productType}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="vatistsa">Vatistsa (Economical)</option>
                                        <option value="leblue">Le Blue (Premium)</option>
                                        <option value="both">Both</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Quantity (bottles) *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        required
                                        min="50"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., 500"
                                    />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Delivery Address *
                                </label>
                                <textarea
                                    name="deliveryAddress"
                                    value={formData.deliveryAddress}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Full delivery address with city and postal code"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Delivery Date
                                    </label>
                                    <input
                                        type="date"
                                        name="preferredDate"
                                        value={formData.preferredDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Requirements
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Tell us about your specific requirements, custom branding needs, etc."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 text-lg"
                            >
                                {loading ? 'Submitting...' : 'Request Bulk Quote'}
                            </button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Our team will respond within 24 hours with a customized quote
                            </p>
                        </motion.form>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-gray-50">
                <div className="container-custom max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-4xl font-light text-gray-900 mb-4">
                            Bulk Order <span className="text-blue-600">FAQ</span>
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "What's the minimum order quantity?",
                                a: "Minimum bulk order is 50 bottles. For custom branding, minimum is 500 bottles."
                            },
                            {
                                q: "Do you offer delivery outside major cities?",
                                a: "Yes, we deliver across Pakistan. Delivery time may vary based on location."
                            },
                            {
                                q: "Can I get samples before placing a bulk order?",
                                a: "Yes, we provide sample packs for business customers. Contact us for details."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We accept bank transfers, JazzCash, Easypaisa, and business checks."
                            },
                            {
                                q: "Is there a return policy for bulk orders?",
                                a: "Yes, we have a satisfaction guarantee. Contact us within 7 days of delivery."
                            }
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white rounded-xl p-6 shadow-sm"
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-500">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-light mb-4">Ready to Place a Bulk Order?</h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Our team is ready to help you with customized solutions for your business
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <a
                            href="tel:+923001234567"
                            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Call Us Now
                        </a>
                        <a
                            href="mailto:bulk@tripure.com"
                            className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Email Us
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default BulkOrder;