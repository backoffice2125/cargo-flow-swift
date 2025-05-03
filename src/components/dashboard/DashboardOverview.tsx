
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Truck, Calendar, Clock, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const DashboardOverview = () => {
  const [recentShipments, setRecentShipments] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get today's date for filtering
        const today = new Date();
        const formattedToday = format(today, 'yyyy-MM-dd');
        
        // Fetch recent shipments
        const { data: recentData, error: recentError } = await supabase
          .from('shipments')
          .select(`
            id,
            driver_name,
            departure_date,
            arrival_date,
            status,
            carrier:carrier_id(name),
            subcarrier:subcarrier_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (recentError) throw recentError;
        
        // Get count of today's shipments
        const { count: todayShipments, error: todayError } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('departure_date', formattedToday);
          
        if (todayError) throw todayError;
        
        // Get count of pending shipments
        const { count: pendingShipments, error: pendingError } = await supabase
          .from('shipments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
          
        if (pendingError) throw pendingError;
        
        setRecentShipments(recentData || []);
        setTodayCount(todayShipments || 0);
        setPendingCount(pendingShipments || 0);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time listener for changes
    const shipmentChannel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'shipments' },
          () => fetchDashboardData()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(shipmentChannel);
    };
  }, []);

  const StatCard = ({ title, value, icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg p-4 border"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 bg-primary/5 rounded-full">
          {icon}
        </div>
      </div>
    </motion.div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Dashboard Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <StatCard 
                title="Today's Shipments" 
                value={todayCount}
                icon={<Calendar className="h-5 w-5 text-primary" />}
              />
              <StatCard 
                title="Pending Shipments" 
                value={pendingCount}
                icon={<Clock className="h-5 w-5 text-primary" />}
              />
              <StatCard 
                title="Recent Activity" 
                value={recentShipments.length}
                icon={<Package className="h-5 w-5 text-primary" />}
              />
            </div>
            
            <h3 className="text-sm font-medium mb-2">Recent Shipments</h3>
            <div className="space-y-3">
              {recentShipments.map((shipment, index) => (
                <motion.div 
                  key={shipment.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-2 border rounded-md flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{shipment.driver_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {shipment.carrier?.name || 'N/A'} - {new Date(shipment.departure_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    shipment.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </span>
                </motion.div>
              ))}
              
              {recentShipments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No recent shipments found</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardOverview;
