// === Imports ===
import React, { useState, useEffect } from 'react';
import logo from '../assets/logowhite.png';
import tapIcon from '../assets/tap.png';

// === Props ===
type IdleSplashProps = {
  onDismiss: () => void;
};

// === Component ===
const IdleSplash: React.FC<IdleSplashProps> = ({ onDismiss }) => {
  // === State ===
  const [visible, setVisible] = useState(false); 
  const [fadingOut, setFadingOut] = useState(false); 

  // === Effects ===
  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  // === Handlers ===
  const handleDismiss = () => {
    setFadingOut(true);
    setVisible(false);

    setTimeout(() => {
      onDismiss();
    }, 1000);
  };

  // === Render ===
  return (
    <div
      className={`fixed inset-0 bg-black z-50 transition-opacity duration-1000 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleDismiss}
      onTouchStart={handleDismiss}
    >
      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-white text-2xl animate-pulse">Tap to Start</p>
      </div>

      {/* Logo */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2">
        <img src={logo} alt="Logo" className="w-auto h-auto" />
      </div>

      {/* Tap Icon */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
        <img src={tapIcon} alt="Tap Icon" className="h-36 w-36 mb-48 ml-11 animate-pulse" />
      </div>
    </div>
  );
};

export default IdleSplash;
