
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipment Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Completed Shipments</p>
                <p className="text-xl font-bold">{stats.totalCompletedShipments}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Gross Weight</p>
                <p className="text-xl font-bold">{stats.totalGrossWeight.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Net Weight</p>
                <p className="text-xl font-bold">{stats.totalNetWeight.toFixed(2)} kg</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Asendia Net Weight</p>
                <p className="text-xl font-bold">{stats.totalAsendiaNetWeight.toFixed(2)} kg</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Other Customers Net Weight</p>
                <p className="text-xl font-bold">{stats.totalOtherNetWeight.toFixed(2)} kg</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShipmentStatsWidget;
