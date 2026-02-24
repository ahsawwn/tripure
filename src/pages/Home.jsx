import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import ProductsSection from '../components/ProductsSection';
import FeaturesSection from '../components/FeaturesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AboutSection />
      <ProductsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Home;