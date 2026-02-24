import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      { name: 'Vatistsa', href: '/vatistsa', color: 'amber' },
      { name: 'Le Blue', href: '/le-blue', color: 'blue' },
      { name: 'Bulk Orders', href: '/bulk', color: 'gray' },
      { name: 'Wholesale', href: '/wholesale', color: 'gray' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Jhelum Facility', href: '/facility' },
      { name: 'Careers', href: '/careers' },
    ],
    support: [
      { name: 'Contact', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Use', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ]
  };

  const socialLinks = [
    { icon: 'facebook', href: '#', color: 'blue' },
    { icon: 'instagram', href: '#', color: 'pink' },
    { icon: 'twitter', href: '#', color: 'blue' },
    { icon: 'linkedin', href: '#', color: 'blue' },
  ];

  // Payment methods with beautiful mini logos
  const paymentMethods = [
    { 
      name: 'JazzCash', 
      logo: 'JC', 
      bg: 'from-red-500 to-red-600',
      text: 'white'
    },
    { 
      name: 'Bank Transfer', 
      logo: '🏦', 
      bg: 'from-blue-500 to-blue-600',
      text: 'white'
    },
    { 
      name: 'Visa', 
      logo: 'VISA', 
      bg: 'from-blue-700 to-blue-900',
      text: 'white',
      classic: true
    },
    { 
      name: 'Mastercard', 
      logo: 'MC', 
      bg: 'from-orange-500 to-red-500',
      text: 'white',
      circle: true
    },
    { 
      name: 'Easypaisa', 
      logo: 'EP', 
      bg: 'from-green-500 to-green-600',
      text: 'white'
    },
  ];

  return (
    <footer className="w-full bg-gradient-to-b from-gray-900 to-gray-950 text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="space-y-4">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">T</span>
                </div>
                <span className="text-xl font-light tracking-wider">Tripure</span>
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed">
                Pakistan's finest sodium-free water, crafted in Jhelum with precision and care for the modern home.
              </p>
              
              {/* Location */}
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">GT Road, Jhelum, Pakistan</span>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">info@tripure.com</span>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">+92 300 1234567</span>
              </div>
            </div>
          </motion.div>

          {/* Products Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-4">
              Products
            </h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className={`text-sm text-gray-400 hover:text-${link.color}-400 transition-colors duration-300 flex items-center gap-2 group`}
                  >
                    <span className={`w-1 h-1 bg-${link.color}-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support & Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-4">
              Support
            </h4>
            <ul className="space-y-3 mb-6">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-medium uppercase tracking-wider text-gray-300 mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Social Links & Newsletter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-800"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Follow us:</span>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.icon}
                    whileHover={{ scale: 1.1, y: -2 }}
                    href={social.href}
                    className={`w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-${social.color}-600 transition-colors duration-300`}
                  >
                    <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      {social.icon === 'facebook' && (
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      )}
                      {social.icon === 'instagram' && (
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                      )}
                      {social.icon === 'twitter' && (
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83A7.72 7.72 0 0 0 23 3z" />
                      )}
                      {social.icon === 'linkedin' && (
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      )}
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div className="flex-1 max-w-md">
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800 rounded-xl text-sm text-white placeholder-gray-400 border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar - Payment Methods & Made with love */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © {currentYear} Tripure Industries. All rights reserved.
            </div>

            {/* Payment Methods - Beautiful Mini Logos */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 uppercase tracking-wider">We Accept</span>
              <div className="flex items-center gap-2">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -2, scale: 1.05 }}
                    className={`relative group`}
                  >
                    {/* Mini Logo Card */}
                    <div className={`
                      w-12 h-8 rounded-lg bg-gradient-to-br ${method.bg} 
                      flex items-center justify-center shadow-lg
                      ${method.classic ? 'font-serif' : 'font-bold'}
                      ${method.circle ? 'rounded-full w-8 h-8' : ''}
                      transform transition-all duration-300 group-hover:shadow-xl
                    `}>
                      {method.name === 'Visa' ? (
                        <span className="text-[10px] font-bold tracking-wider text-white">VISA</span>
                      ) : method.name === 'Mastercard' ? (
                        <div className="flex -space-x-1">
                          <div className="w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                          <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        </div>
                      ) : (
                        <span className="text-xs text-white">{method.logo}</span>
                      )}
                    </div>

                    {/* Tooltip on Hover */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    >
                      {method.name}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Made with love by Ahsawwn */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex items-center gap-2"
            >
              <span className="text-sm text-gray-500">Made with</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </motion.div>
              <span className="text-sm text-gray-300">by</span>
              <motion.a 
                href="#"
                whileHover={{ scale: 1.05 }}
                className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
              >
                Ahsawwn
              </motion.a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Heart Animation */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs shadow-lg flex items-center gap-1"
        >
          <span>❤️</span>
          <span>Made by Ahsawwn</span>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;