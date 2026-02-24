import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Ahmed Khan",
      location: "Jhelum",
      text: "Vatistsa has become our family's choice. Pure taste and affordable price. Finally sodium-free water that doesn't feel like a luxury.",
      brand: "Vatistsa",
      rating: 5,
      color: "amber"
    },
    {
      name: "Fatima Ali",
      location: "Islamabad",
      text: "Le Blue is absolutely premium. The glass bottles look stunning on our dining table, and the water tastes incredibly fresh. Worth every rupee.",
      brand: "Le Blue",
      rating: 5,
      color: "blue"
    },
    {
      name: "Usman Malik",
      location: "Lahore",
      text: "I have high blood pressure and needed sodium-free water. Tripure delivered. Both brands are excellent, but Le Blue is my weekend indulgence.",
      brand: "Both",
      rating: 5,
      color: "purple"
    }
  ];

  return (
    <section className="w-full py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
            What Our <span className="text-gray-400">Customers Say</span>
          </h2>
        </motion.div>

        {/* Testimonials Slider */}
        <div className="max-w-4xl mx-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="text-6xl font-light text-gray-200 mb-4">"</div>
              
              {/* Testimonial Text */}
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                {testimonials[currentIndex].text}
              </p>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {testimonials[currentIndex].location}
                  </p>
                </div>
                
                {/* Brand Badge */}
                <span className={`px-4 py-2 rounded-full text-sm bg-${testimonials[currentIndex].color}-50 text-${testimonials[currentIndex].color}-600`}>
                  {testimonials[currentIndex].brand}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? `w-8 bg-${testimonials[index].color}-500` 
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;