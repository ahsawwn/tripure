import React from 'react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  return (
    <section className="w-full py-24 bg-white">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Image Collage */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative h-[500px]"
          >
            <div className="absolute top-0 left-0 w-64 h-64 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1564419320464-68796b5f3d5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Jhelum River"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-72 h-72 rounded-2xl overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Water Source"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <img 
                src="https://images.unsplash.com/photo-1616118132534-7315b7b0b0c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                alt="Tripure Bottle"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/4 -left-4 w-20 h-20 bg-blue-100 rounded-full blur-2xl"></div>
            <div className="absolute -z-10 bottom-1/4 -right-4 w-20 h-20 bg-amber-100 rounded-full blur-2xl"></div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              Our Story
            </span>
            
            <h2 className="text-4xl md:text-5xl font-light text-gray-900">
              Born in Jhelum,<br />
              <span className="text-gray-400">Pure by Nature</span>
            </h2>
            
            <p className="text-gray-600 leading-relaxed">
              Nestled in the heart of Jhelum, Pakistan, Tripure Industries began with a simple mission: 
              to provide the purest sodium-free water to every Pakistani home. Our journey started in 2024, 
              driven by a passion for health and hydration.
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              What makes us different? We don't just filter water—we craft it. Using advanced purification 
              technology while maintaining the natural minerals your body needs. Sodium-free, never tasteless.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div>
                <div className="text-3xl font-light text-blue-600">2024</div>
                <div className="text-xs text-gray-400">Founded</div>
              </div>
              <div>
                <div className="text-3xl font-light text-amber-600">2</div>
                <div className="text-xs text-gray-400">Brands</div>
              </div>
              <div>
                <div className="text-3xl font-light text-emerald-600">100%</div>
                <div className="text-xs text-gray-400">Sodium Free</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;