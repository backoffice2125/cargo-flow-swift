
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

const WelcomeWidget = () => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Guest';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="col-span-2"
    >
      <Card className="overflow-hidden border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-swift-blue-50 to-transparent">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-swift-blue-800 flex items-center">
              <span>Welcome, {username}!</span>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="ml-2"
              >
                <Truck className="h-5 w-5 text-swift-blue-600" />
              </motion.div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground"
          >
            Here's your shipment management dashboard with real-time updates.
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WelcomeWidget;
