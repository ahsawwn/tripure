import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const About = () => {
  // Animation variants
  const fadeInUp = {
    initial: { y: 30, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" },
    viewport: { once: true }
  };

  const staggerContainer = {
    whileInView: {
      transition: {
        staggerChildren: 0.2
      }
    },
    viewport: { once: true }
  };

  const teamMembers = [
    {
      name: "Ahsan Khan",
      role: "Founder & CEO",
      bio: "Visionary entrepreneur with a passion for pure hydration",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      color: "blue"
    },
    {
      name: "Fatima Ahmed",
      role: "Head of Operations",
      bio: "Ensuring every drop meets our purity standards",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      color: "amber"
    },
    {
      name: "Zain Malik",
      role: "Quality Control",
      bio: "10+ years in water purification technology",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      color: "emerald"
    }
  ];

  const timeline = [
    {
      year: "2024",
      title: "Tripure Founded",
      description: "Started in Jhelum with a mission to provide sodium-free water to Pakistan",
      icon: "🌊"
    },
    {
      year: "2024",
      title: "Vatistsa Launched",
      description: "Economical range for everyday hydration needs",
      icon: "💧"
    },
    {
      year: "2024",
      title: "Le Blue Launched",
      description: "Premium glass-bottled collection for luxury seekers",
      icon: "✨"
    },
    {
      year: "2025",
      title: "Expanding Reach",
      description: "Planning to serve all major cities of Pakistan",
      icon: "🚀"
    }
  ];

  const values = [
    {
      title: "Purity First",
      description: "100% sodium-free water with natural minerals preserved",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "blue"
    },
    {
      title: "Local Pride",
      description: "Proudly made in Jhelum, serving all of Pakistan",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "green"
    },
    {
      title: "Innovation",
      description: "Advanced purification technology for perfect taste",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "purple"
    },
    {
      title: "Sustainability",
      description: "Eco-friendly processes and recyclable packaging",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: "emerald"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              Our Story
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mt-4 mb-6">
              Pure Water,<br />
              <span className="text-gray-400">Pure Passion</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed">
              From the heart of Jhelum to homes across Pakistan, we're on a mission to 
              redefine hydration with sodium-free water that doesn't compromise on taste.
            </p>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 100" fill="none">
            <path d="M0,50L80,55C160,60,320,70,480,70C640,70,800,60,960,50C1120,40,1280,30,1360,25L1440,20L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Image Collage */}
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
                  alt="Water Purification"
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
              
              {/* Floating Stats */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 left-10 bg-white rounded-xl shadow-lg p-4"
              >
                <div className="text-2xl font-light text-blue-600">2024</div>
                <div className="text-xs text-gray-400">Founded</div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -top-6 right-10 bg-white rounded-xl shadow-lg p-4"
              >
                <div className="text-2xl font-light text-amber-600">2</div>
                <div className="text-xs text-gray-400">Brands</div>
              </motion.div>
            </motion.div>

            {/* Right - Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-light text-gray-900">
                Born in <span className="text-blue-600">Jhelum</span>
              </h2>
              
              <p className="text-gray-600 leading-relaxed">
                Tripure Industries began with a simple observation: Pakistan deserved better water. 
                Water that's pure, sodium-free, and actually tastes like water should.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                Located in the historic city of Jhelum, we source our water from protected aquifers 
                and purify it using advanced technology while preserving natural minerals. The result? 
                Water that's clean, crisp, and completely sodium-free.
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                We created two distinct lines—<span className="text-amber-600 font-medium">Vatistsa</span> for everyday 
                hydration and <span className="text-blue-600 font-medium">Le Blue</span> for those special moments—so 
                every Pakistani can enjoy pure water, whatever their budget.
              </p>

              {/* Signature */}
              <div className="pt-6">
                <p className="text-gray-400 text-sm">Founder's Note</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <p className="font-light text-gray-900">Ahsan Khan</p>
                    <p className="text-xs text-gray-400">Founder, Tripure Industries</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
              From Vision to <span className="text-gray-400">Reality</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="relative group"
              >
                {/* Year Badge */}
                <div className={`absolute -top-3 left-6 bg-${index === 0 ? 'blue' : index === 1 ? 'amber' : index === 2 ? 'purple' : 'emerald'}-500 text-white text-sm px-3 py-1 rounded-full`}>
                  {item.year}
                </div>
                
                {/* Card */}
                <div className="bg-white rounded-2xl p-8 pt-10 shadow-lg border border-gray-100 group-hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>

                {/* Connector Line (except last) */}
                {index < timeline.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200"></div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              What Drives Us
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
              Our Core <span className="text-gray-400">Values</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group text-center"
              >
                <div className={`w-20 h-20 mx-auto mb-6 bg-${value.color}-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`text-${value.color}-600`}>
                    {value.icon}
                  </div>
                </div>
                <h3 className={`text-xl font-medium text-gray-900 mb-2`}>
                  {value.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            variants={fadeInUp}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-sm uppercase tracking-[0.3em] text-blue-600 font-medium">
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mt-4">
              People Behind <span className="text-gray-400">the Purity</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-80 overflow-hidden">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t from-${member.color}-900/70 via-transparent to-transparent`}></div>
                  
                  {/* Role Badge */}
                  <div className={`absolute bottom-4 left-4 bg-${member.color}-500 text-white text-xs px-3 py-1 rounded-full`}>
                    {member.role}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-medium text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-light mb-2">2024</div>
              <div className="text-sm text-blue-200">Founded</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-light mb-2">2</div>
              <div className="text-sm text-blue-200">Brands</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-light mb-2">100%</div>
              <div className="text-sm text-blue-200">Sodium Free</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-light mb-2">5+</div>
              <div className="text-sm text-blue-200">Cities</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
              Ready to Taste <span className="text-gray-400">the Difference?</span>
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              Join thousands of Pakistani families who've made the switch to sodium-free hydration.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/products"
                className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Explore Our Brands
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="/contact"
                className="px-8 py-3 bg-white text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-gray-300 transition-colors"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;