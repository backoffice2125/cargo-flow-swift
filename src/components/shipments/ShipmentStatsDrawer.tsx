
import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  DrawerClose, 
  DrawerContent, 
  DrawerHeader,
  DrawerTitle,
  DrawerFooter
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { X, Scale, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Shipment {
  id: string;
  driver_name: string;
  departure_date: string;
  arrival_date: string;
  carrier: { name: string } | null;
  subcarrier: { name: string } | null;
}

interface ShipmentStatsDrawerProps {
  shipment: Shipment | null;
  open: boolean;
  onClose: () => void;
}

interface ShipmentStats {
  totalGrossWeight: number;
  totalNetWeight: number;
  totalAsendiaNetWeight: number;
  totalOtherNetWeight: number;
  detailsCount: number;
  bagsCount: number;
  palletsCount: number;
}

const ShipmentStatsDrawer = ({ shipment, open, onClose }: ShipmentStatsDrawerProps) => {
  const [stats, setStats] = useState<ShipmentStats>({
    totalGrossWeight: 0,
    totalNetWeight: 0,
    totalAsendiaNetWeight: 0,
    totalOtherNetWeight: 0,
    detailsCount: 0,
    bagsCount: 0,
    palletsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShipmentStats = async () => {
      if (!shipment) return;
      
      try {
        setLoading(true);
        
        const { data: details, error } = await supabase
          .from('shipment_details')
          .select(`
            gross_weight,
            tare_weight,
            net_weight,
            number_of_bags,
            number_of_pallets,
            customer:customer_id(is_asendia)
          `)
          .eq('shipment_id', shipment.id);
          
        if (error) throw error;
        
        const statsData: ShipmentStats = {
          totalGrossWeight: 0,
          totalNetWeight: 0,
          totalAsendiaNetWeight: 0,
          totalOtherNetWeight: 0,
          detailsCount: details?.length || 0,
          bagsCount: 0,
          palletsCount: 0,
        };
        
        if (details?.length) {
          statsData.totalGrossWeight = details.reduce((sum, detail) => sum + Number(detail.gross_weight || 0), 0);
          statsData.totalNetWeight = details.reduce((sum, detail) => sum + Number(detail.net_weight || 0), 0);
          statsData.totalAsendiaNetWeight = details
            .filter(detail => detail.customer?.is_asendia)
            .reduce((sum, detail) => sum + Number(detail.net_weight || 0), 0);
          statsData.totalOtherNetWeight = details
            .filter(detail => !detail.customer?.is_asendia)
            .reduce((sum, detail) => sum + Number(detail.net_weight || 0), 0);
          statsData.bagsCount = details.reduce((sum, detail) => sum + Number(detail.number_of_bags || 0), 0);
          statsData.palletsCount = details.reduce((sum, detail) => sum + Number(detail.number_of_pallets || 0), 0);
        }
        
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching shipment stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (open && shipment) {
      fetchShipmentStats();
    }
  }, [shipment, open]);

  const StatItem = ({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-lg p-4 border"
    >
      <div className="flex items-center mb-2">
        <div className="p-2 bg-primary/5 rounded-md text-primary mr-3">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </motion.div>
  );

  return (
    <Drawer open={open} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent>
        <DrawerHeader className="border-b">
          <DrawerTitle>
            {shipment ? `${shipment.driver_name}'s Shipment Stats` : 'Shipment Stats'}
          </DrawerTitle>
          <DrawerClose onClick={onClose} className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </DrawerClose>
        </DrawerHeader>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="p-4">
            {shipment && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Carrier: {shipment.carrier?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground mb-1">Subcarrier: {shipment.subcarrier?.name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">Dates: {new Date(shipment.departure_date).toLocaleDateString()} - {new Date(shipment.arrival_date).toLocaleDateString()}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatItem 
                title="Total Details" 
                value={stats.detailsCount}
                icon={<Package className="h-4 w-4" />}
              />
              <StatItem 
                title="Total Weight" 
                value={`${stats.totalGrossWeight.toFixed(2)} kg`}
                icon={<Scale className="h-4 w-4" />}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <StatItem 
                title="Bags" 
                value={stats.bagsCount}
                icon={<Package className="h-4 w-4" />}
              />
              <StatItem 
                title="Pallets" 
                value={stats.palletsCount}
                icon={<Package className="h-4 w-4" />}
              />
            </div>
            
            <h3 className="text-lg font-semibold mb-3">Weight Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <StatItem 
                title="Net Weight" 
                value={`${stats.totalNetWeight.toFixed(2)} kg`}
                icon={<Scale className="h-4 w-4" />}
              />
              <StatItem 
                title="Asendia A/C Net Weight" 
                value={`${stats.totalAsendiaNetWeight.toFixed(2)} kg`}
                icon={<Scale className="h-4 w-4" />}
              />
              <StatItem 
                title="Other Customers Net Weight" 
                value={`${stats.totalOtherNetWeight.toFixed(2)} kg`}
                icon={<Scale className="h-4 w-4" />}
              />
            </div>
          </div>
        )}
        
        <DrawerFooter className="border-t">
          <Button onClick={onClose}>Close</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ShipmentStatsDrawer;
