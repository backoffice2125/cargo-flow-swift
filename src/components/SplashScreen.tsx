
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    // Check if this is the first load of the app in this session
    const hasAppOpened = sessionStorage.getItem('appOpened');
    
    if (hasAppOpened) {
      // Skip splash screen if app was already opened in this session
      setShow(false);
      onComplete();
      return;
    }
    
    // Mark that the app has been opened in this session
    sessionStorage.setItem('appOpened', 'true');
    
    // Show splash screen for 2 seconds
    const timer = setTimeout(() => {
      setShow(false);
      
      // Give animation time to complete before calling onComplete
      setTimeout(onComplete, 500);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!show) return null;
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-2">Cargo Flow Swift</h1>
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5 
              }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
