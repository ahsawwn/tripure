import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  AtSymbolIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white relative overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-600/20 blur-[150px] rounded-full"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        {/* Logo Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-6">
            <span className="text-4xl font-black text-white">T</span>
          </div>
          <h2 className="text-xl font-bold tracking-[0.2em] text-blue-400 uppercase">Tripure</h2>
        </motion.div>

        {/* Main Heading */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-light tracking-tight leading-tight"
          >
            Purity in Every <span className="font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">Drop</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 font-light max-w-2xl mx-auto"
          >
            Our world-class mineral water platform is undergoing a major transformation.
            We are preparing some exciting new features for you.
          </motion.p>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl inline-block"
        >
          <div className="flex flex-col items-center gap-6">
            <div className="bg-blue-500/20 p-4 rounded-2xl">
              <ClockIcon className="w-10 h-10 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Launching Very Soon</h3>
              <p className="text-slate-400 mt-2">Check back in a few days for the full experience.</p>
            </div>

            {/* Admin Login Shortcut (Subtle) */}
            <div className="mt-8 pt-8 border-t border-white/10 w-full flex justify-center">
              <Link
                to="/admin/login"
                className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors text-sm font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Admin Access
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5"
        >
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <AtSymbolIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm">hello@tripure.com</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <PhoneIcon className="w-5 h-5 text-blue-400" />
            <span className="text-sm">+1 (234) 567-890</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-slate-400">
            <MapPinIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm">World-wide Purity</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom Glow */}
      <div className="absolute -bottom-1/2 left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default ComingSoon;