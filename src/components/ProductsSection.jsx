import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ProductsSection = () => {
  const products = [
    {
      brand: "Vatistsa",
      tagline: "Everyday Purity",
      description: "Perfect for daily hydration at home and office. Economical without compromise.",
      prices: [
        { size: "5L", price: "₨ 99" },
        { size: "10L", price: "₨ 189" },
        { size: "20L", price: "₨ 349" }
      ],
      features: ["Sodium Free", "BPA Free Bottle", "Family Size"],
      color: "amber",
      bg: "from-amber-50 to-amber-100/50",
      border: "border-amber-200",
      accent: "amber-600",
      buttonBg: "bg-amber-600",
      buttonHover: "hover:bg-amber-700",
      path: "/vatistsa"
    },
    {
      brand: "Le Blue",
      tagline: "Premium Luxury",
      description: "Artisan-crafted in glass for those who appreciate the finer things in life.",
      prices: [
        { size: "750ml", price: "₨ 299" },
        { size: "1L", price: "₨ 399" },
        { size: "1.5L", price: "₨ 549" }
      ],
      features: ["Sodium Free", "Glass Bottle", "Premium Minerals"],
      color: "blue",
      bg: "from-blue-50 to-blue-100/50",
      border: "border-blue-200",
      accent: "blue-600",
      buttonBg: "bg-blue-600",
      buttonHover: "hover:bg-blue-700",
      path: "/le-blue"
    }
  ];

  return (
    <section className="w-full py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
            Our Collections
          </span>
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
            Choose Your <span className="text-gray-400">Purity</span>
          </h2>
          <p className="text-gray-500 mt-4">
            Two distinct collections, one commitment to purity
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {products.map((product, index) => (
            <motion.div
              key={product.brand}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${product.bg} rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              
              {/* Main Card */}
              <div className={`relative bg-white rounded-3xl p-8 shadow-lg border ${product.border} group-hover:shadow-2xl transition-all duration-500`}>
                {/* Brand Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-3xl font-light text-${product.color}-900`}>
                      {product.brand}
                    </h3>
                    <p className={`text-${product.color}-500 text-sm mt-1`}>
                      {product.tagline}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full bg-${product.color}-100 flex items-center justify-center`}>
                    <span className={`text-${product.color}-600 text-xl font-light`}>
                      {product.brand[0]}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-8">
                  {product.description}
                </p>

                {/* Price List */}
                <div className="space-y-3 mb-8">
                  {product.prices.map((item) => (
                    <div key={item.size} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500">{item.size}</span>
                      <span className={`text-xl font-light text-${product.accent}`}>
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {product.features.map((feature) => (
                    <span key={feature} className={`px-3 py-1 bg-${product.color}-50 rounded-full text-xs text-${product.color}-700`}>
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Order Button - Fixed with explicit classes */}
                <Link
                  to={product.path}
                  className={`block w-full py-3 text-center rounded-xl text-white font-medium transition-all duration-300 ${product.buttonBg} ${product.buttonHover} shadow-md hover:shadow-lg`}
                >
                  Order {product.brand} Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link 
            to="/products" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors"
          >
            <span>View All Products</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;