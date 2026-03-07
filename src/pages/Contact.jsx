import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        type: 'contact' // Default type
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        }

        return newErrors;
    };

// In your form submission, make sure company is sent as null if empty
const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fill in all required fields');
        return;
    }

    setLoading(true);

    try {
        // Prepare data - ensure empty strings become null
        const submitData = {
            ...formData,
            company: formData.company || null,
            phone: formData.phone || null,
            subject: formData.subject || null,
            type: 'contact',
            page_url: window.location.pathname
        };

        const response = await axios.post(`${API_URL}/contact/submit`, submitData);

        if (response.data.success) {
            toast.success('Message sent successfully! We\'ll get back to you soon.');
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                company: '',
                subject: '',
                message: '',
                type: 'contact'
            });
        }
    } catch (error) {
        console.error('Contact error:', error);
        toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
                            Get in <span className="text-blue-600">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-600">
                            Have questions about our products? We're here to help!
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <h2 className="text-3xl font-light text-gray-900 mb-4">Visit Our Facility</h2>
                                <p className="text-gray-600">
                                    Located in the heart of Jhelum, we're always happy to welcome visitors.
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Address</h3>
                                        <p className="text-gray-600">GT Road, Jhelum, Pakistan</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <a href="mailto:info@tripure.com" className="text-blue-600 hover:underline">
                                            info@tripure.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Phone</h3>
                                        <a href="tel:+923001234567" className="text-blue-600 hover:underline">
                                            +92 300 1234567
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div className="h-64 bg-gray-200 rounded-xl overflow-hidden">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106776.98635401382!2d73.68872678747293!3d32.94265371249646!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391f9d0d4c5c5c5d%3A0x9c5c5c5c5c5c5c5c!2sJhelum%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1620000000000!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    title="Jhelum Location"
                                ></iframe>
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
                        >
                            <h2 className="text-2xl font-light text-gray-900 mb-6">Send us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                errors.name ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder="Your full name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition ${
                                                errors.email ? 'border-red-500' : 'border-gray-200'
                                            }`}
                                            placeholder="your@email.com"
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Phone (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="+92 300 1234567"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                            placeholder="Your company"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                        placeholder="What's this about?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="message"
                                        rows="5"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none ${
                                            errors.message ? 'border-red-500' : 'border-gray-200'
                                        }`}
                                        placeholder="How can we help you?"
                                    />
                                    {errors.message && (
                                        <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        'Send Message'
                                    )}
                                </button>

                                <p className="text-xs text-gray-400 text-center mt-4">
                                    Your information is secure and will only be used to respond to your inquiry.
                                </p>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Contact;