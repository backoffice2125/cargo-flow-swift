
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Scale, Package, TrendingUp, ArrowRight } from 'lucide-react';

interface ShipmentStats {
  totalCompletedShipments: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  totalAsendiaNetWeight: number;
  totalOtherNetWeight: number;
}

const ShipmentStatsWidget = () => {
  const [stats, setStats] = useState<ShipmentStats>({
    totalCompletedShipments: 0,
    totalGrossWeight: 0,
    totalNetWeight: 0,
    totalAsendiaNetWeight: 0,
    totalOtherNetWeight: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // Get all completed shipments
        const { data: shipments, error: shipmentError } = await supabase
          .from('shipments')
          .select('id')
          .eq('status', 'completed');
          
        if (shipmentError) throw shipmentError;
        
        // If there are shipments, get details for weight calculations
        if (shipments?.length) {
          const shipmentIds = shipments.map(s => s.id);
          
          // Get all details for these shipments
          const { data: details, error: detailsError } = await supabase
            .from('shipment_details')
            .select(`
              gross_weight,
              tare_weight,
              net_weight,
              customer:customer_id(is_asendia)
            `)
            .in('shipment_id', shipmentIds);
            
          if (detailsError) throw detailsError;
          
          // Calculate totals
          const totalStats = details?.reduce((acc, detail) => {
            acc.totalGrossWeight += Number(detail.gross_weight || 0);
            acc.totalNetWeight += Number(detail.net_weight || 0);
            
            if (detail.customer?.is_asendia) {
              acc.totalAsendiaNetWeight += Number(detail.net_weight || 0);
            } else {
              acc.totalOtherNetWeight += Number(detail.net_weight || 0);
            }
            
            return acc;
          }, {
            totalGrossWeight: 0,
            totalNetWeight: 0,
            totalAsendiaNetWeight: 0,
            totalOtherNetWeight: 0,
          });
          
          setStats({
            totalCompletedShipments: shipments.length,
            ...totalStats,
          });
        }
      } catch (error) {
        console.error('Error fetching shipment stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
    
    // Set up real-time subscription for shipment and detail changes
    const shipmentChannel = supabase
      .channel('shipment-stats-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'shipments' },
          () => fetchStats()
      )
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'shipment_details' },
          () => fetchStats()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(shipmentChannel);
    };
  }, []);

  const StatItem = ({ title, value, icon, className = "" }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-background rounded-lg p-4 shadow-sm border border-primary/10 ${className}`}
    >
      <div className="flex items-center mb-2">
        <div className="p-2 bg-swift-blue-50 rounded-md text-swift-blue-600 mr-3">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-all duration-300">
        <CardHeader className="pb-2 bg-gradient-to-r from-swift-blue-50 to-transparent">
          <CardTitle className="text-xl text-swift-blue-800 flex items-center">
            <Scale className="h-5 w-5 mr-2 text-swift-blue-600" />
            Shipment Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <motion.div 
                animate={{ 
                  rotate: 360,
                  transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
                }}
                className="w-8 h-8 border-3 border-swift-blue-300 border-t-swift-blue-600 rounded-full"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatItem 
                  title="Completed Shipments" 
                  value={stats.totalCompletedShipments}
                  icon={<Package className="h-4 w-4" />}
                />
                <StatItem 
                  title="Total Gross Weight" 
                  value={`${stats.totalGrossWeight.toFixed(2)} kg`}
                  icon={<Scale className="h-4 w-4" />}
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <StatItem 
                  title="Total Net Weight" 
                  value={`${stats.totalNetWeight.toFixed(2)} kg`}
                  icon={<TrendingUp className="h-4 w-4" />}
                  className="bg-swift-blue-50/50"
                />
              </div>
              
              <div className="relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute left-0 top-1/2 h-0.5 bg-swift-blue-100 transform -translate-y-1/2 z-0"
                />
                <div className="relative z-10 flex justify-center my-2">
                  <div className="bg-background px-4 text-sm text-muted-foreground">
                    Customer Breakdown
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <StatItem 
                  title="Asendia A/C Net Weight" 
                  value={`${stats.totalAsendiaNetWeight.toFixed(2)} kg`}
                  icon={<ArrowRight className="h-4 w-4" />}
                />
                <StatItem 
                  title="Other Customers Net Weight" 
                  value={`${stats.totalOtherNetWeight.toFixed(2)} kg`}
                  icon={<ArrowRight className="h-4 w-4" />}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ShipmentStatsWidget;
