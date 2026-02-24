import React from 'react';
import { motion } from 'framer-motion';

const ContactSection = () => {
  return (
    <section className="w-full py-24 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left Side - Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              Visit Us
            </span>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900">
              Get in <span className="text-gray-400">Touch</span>
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              Visit our facility in Jhelum or contact us for bulk orders, partnerships, or any questions about our products.
            </p>

            {/* Contact Info Cards */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Address</h4>
                  <p className="text-gray-900">GT Road, Jhelum, Pakistan</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Phone</h4>
                  <p className="text-gray-900">+92 300 1234567</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm text-gray-400">Email</h4>
                  <p className="text-gray-900">info@tripure.com</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-3xl p-8 shadow-lg"
          >
            <h3 className="text-2xl font-light text-gray-900 mb-6">Send a Message</h3>
            
            <form className="space-y-4">
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
              />
              <input 
                type="email" 
                placeholder="Email Address"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
              />
              <input 
                type="tel" 
                placeholder="Phone Number"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
              />
              <select className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors">
                <option>Select Product</option>
                <option>Vatistsa</option>
                <option>Le Blue</option>
                <option>Both / Bulk Order</option>
              </select>
              <textarea 
                rows="4"
                placeholder="Your Message"
                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
              ></textarea>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
              >
                Send Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;