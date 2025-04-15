
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Truck, Package } from 'lucide-react';

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
    
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShow(false);
      
      // Give animation time to complete before calling onComplete
      setTimeout(onComplete, 600);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  if (!show) return null;
  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-swift-blue-50 via-background to-swift-blue-50 dark:from-swift-dark-900 dark:via-background dark:to-swift-dark-900"
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
            <motion.div 
              className="flex items-center justify-center mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="bg-swift-blue-100 dark:bg-swift-blue-900 rounded-full p-4 shadow-lg"
              >
                <Truck className="w-10 h-10 text-swift-blue-600 dark:text-swift-blue-400" />
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold mb-2 text-swift-blue-800 dark:text-swift-blue-200"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Cargo Flow Swift
            </motion.h1>
            
            <motion.div
              className="relative w-64 h-2 bg-swift-blue-100 dark:bg-swift-blue-900 rounded-full overflow-hidden mx-auto mt-6"
              initial={{ width: 0 }}
              animate={{ width: "16rem" }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.div
                className="absolute top-0 left-0 h-full bg-swift-blue-600 dark:bg-swift-blue-400 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.6, duration: 1.2 }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
