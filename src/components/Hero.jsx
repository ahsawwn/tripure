import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Carousel items with actual images
  const carouselItems = [
    {
      id: 1,
      brand: "Vatistsa",
      tagline: "Essential purity for daily life",
      type: "economical",
      volume: "5L • 10L • 20L",
      price: "₨ 99",
      color: "amber",
      gradient: "from-amber-400/20 to-amber-600/20",
      accent: "amber-400",
      image: "https://ik.imagekit.io/ahsawwn/vatista.png?updatedAt=1771879351505",
      description: "Pure hydration for everyday"
    },
    {
      id: 2,
      brand: "Le Blue",
      tagline: "Crystal luxury in glass",
      type: "premium",
      volume: "750ml • 1L • 1.5L",
      price: "₨ 299",
      color: "blue",
      gradient: "from-blue-400/20 to-blue-600/20",
      accent: "blue-400",
      image: "https://ik.imagekit.io/ahsawwn/le-blue.png?updatedAt=1771879351125",
      description: "Artisan collection in glass"
    },
    {
      id: 3,
      brand: "Both Collections",
      tagline: "Choose your purity",
      type: "complete",
      volume: "All sizes available",
      price: "Shop both",
      color: "purple",
      gradient: "from-purple-400/20 to-purple-600/20",
      accent: "purple-400",
      image: "https://ik.imagekit.io/ahsawwn/vb.png?updatedAt=1771879463514",
      description: "Complete your hydration"
    }
  ];

  // Auto-play
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, carouselItems.length]);

  // Navigation
  const nextSlide = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const goToSlide = (index) => {
    setIsAutoPlaying(false);
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Animation variants
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -500 : 500,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1]
      }
    })
  };

  // Company name split
  const companyName = "TRIPURE".split("");
  const industryName = "Industries".split("");

  return (
    <section className="relative w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
      {/* Minimal Grid Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #2563eb 0.5px, transparent 0.5px),
              linear-gradient(to bottom, #2563eb 0.5px, transparent 0.5px)
            `,
            backgroundSize: '80px 80px'
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-200/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-6 md:px-12 lg:px-20 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Text Content */}
              <motion.div
                initial="initial"
                animate="animate"
                className="space-y-8"
              >
                {/* Since badge */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-gray-400">
                    <span className="w-8 h-px bg-blue-300"></span>
                    Since 2024
                    <span className="w-8 h-px bg-blue-300"></span>
                  </span>
                </motion.div>

                {/* Company name with letter animation */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-x-2">
                    {companyName.map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="text-6xl md:text-7xl lg:text-8xl font-light text-gray-900"
                        style={{
                          textShadow: '2px 2px 30px rgba(37,99,235,0.1)'
                        }}
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    {industryName.map((letter, index) => (
                      <motion.span
                        key={index}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.4 + index * 0.03 }}
                        className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-300"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Location with icon */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center gap-2 text-gray-400 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full w-fit"
                >
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-light">Jhelum, Pakistan</span>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                  className="text-gray-500 text-lg max-w-md leading-relaxed"
                >
                  Pakistan's finest sodium-free water, crafted with precision for those who seek purity in every drop.
                </motion.p>

                {/* Features Grid */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="grid grid-cols-3 gap-4 pt-4"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Sodium Free</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-amber-50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">Natural Minerals</span>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 mx-auto mb-2 bg-emerald-50 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-500">BPA Free</span>
                  </div>
                </motion.div>

                {/* Buttons - Get Quote and Our Story */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="flex flex-col sm:flex-row gap-4 pt-4"
                >
                  <motion.a
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                    href="/get-quote"
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-sm font-medium overflow-hidden shadow-lg hover:shadow-xl transition-all"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Get a Quote
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </motion.a>
                  
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    href="/story"
                    className="group px-8 py-4 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Our Story
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </motion.a>
                </motion.div>
              </motion.div>

              {/* Right Side - Enhanced Picture Carousel */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative h-[600px] lg:h-[650px]"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Main Carousel Container */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentIndex}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="absolute w-full max-w-md"
                    >
                      {/* Glass Card with Image */}
                      <div className="relative">
                        {/* Background Glow */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${carouselItems[currentIndex].gradient} rounded-[3rem] blur-2xl`}></div>
                        
                        {/* Main Card */}
                        <div className="relative bg-white/90 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/50">
                          {/* Image Container */}
                          <div className="relative h-64 overflow-hidden">
                            <motion.img 
                              src={carouselItems[currentIndex].image}
                              alt={carouselItems[currentIndex].brand}
                              className="w-full h-full object-cover"
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.6 }}
                            />
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-${carouselItems[currentIndex].color}-900/50 via-transparent to-transparent`}></div>
                            
                            {/* Brand Badge */}
                            <div className="absolute top-4 left-4">
                              <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white border border-white/30`}>
                                {carouselItems[currentIndex].brand}
                              </span>
                            </div>
                            
                            {/* Price Badge */}
                            <div className="absolute top-4 right-4">
                              <span className={`px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-900 shadow-lg`}>
                                {carouselItems[currentIndex].price}
                              </span>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-8 space-y-4">
                            <div>
                              <h3 className={`text-2xl font-light text-${carouselItems[currentIndex].color}-900`}>
                                {carouselItems[currentIndex].tagline}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {carouselItems[currentIndex].description}
                              </p>
                            </div>

                            {/* Volume Tags */}
                            <div className="flex flex-wrap gap-2">
                              {carouselItems[currentIndex].volume.split(' • ').map((vol, i) => (
                                <span key={i} className={`px-3 py-1 bg-${carouselItems[currentIndex].color}-50 rounded-full text-xs text-${carouselItems[currentIndex].color}-700`}>
                                  {vol}
                                </span>
                              ))}
                            </div>

                            {/* Features */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 text-${carouselItems[currentIndex].color}-500`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500">Sodium Free</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <svg className={`w-4 h-4 text-${carouselItems[currentIndex].color}-500`} fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs text-gray-500">Natural</span>
                              </div>
                            </div>

                            {/* Shop Now Button */}
                            <motion.a
                              href={`/${carouselItems[currentIndex].brand.toLowerCase().replace(' ', '-')}`}
                              className={`block w-full mt-4 py-3 text-center text-sm font-medium rounded-xl bg-${carouselItems[currentIndex].color}-50 text-${carouselItems[currentIndex].color}-700 hover:bg-${carouselItems[currentIndex].color}-100 transition-colors`}
                              whileHover={{ y: -2 }}
                            >
                              Shop {carouselItems[currentIndex].brand}
                            </motion.a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-6">
                  {/* Prev Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={prevSlide}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                    </svg>
                  </motion.button>

                  {/* Dots */}
                  <div className="flex gap-3">
                    {carouselItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className="group relative"
                      >
                        <div className={`h-2 transition-all duration-300 rounded-full ${
                          index === currentIndex 
                            ? `w-8 bg-${item.color}-500` 
                            : 'w-2 bg-gray-300 group-hover:bg-gray-400'
                        }`} />
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={nextSlide}
                    className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-100"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="absolute -top-6 left-0 right-0 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    key={currentIndex}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className={`h-full bg-${carouselItems[currentIndex].color}-500`}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-auto" viewBox="0 0 1440 60" fill="none" preserveAspectRatio="none">
          <path d="M0,30L80,32C160,34,320,38,480,36C640,34,800,26,960,24C1120,22,1280,26,1360,28L1440,30L1440,60L1360,60C1280,60,1120,60,960,60C800,60,640,60,480,60C320,60,160,60,80,60L0,60Z" fill="#f8fafc" fillOpacity="0.5"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;