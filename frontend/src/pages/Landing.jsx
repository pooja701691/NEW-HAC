import React from 'react';
import Navbar from '../components/layout/Navbar';
import HeroSection from '../components/HeroSection';

const Landing = () => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Landing;