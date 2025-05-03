
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import ShipmentTable from '@/components/shipments/ShipmentTable';
import ShipmentStatsDrawer from '@/components/shipments/ShipmentStatsDrawer';

interface Shipment {
  id: string;
  driver_name: string;
  departure_date: string;
  arrival_date: string;
  status: string;
  seal_no: string;
  truck_reg_no: string;
  trailer_reg_no: string;
  created_at: string;
  carrier: { name: string } | null;
  subcarrier: { name: string } | null;
}

const ShipmentCard = ({ shipment }: { shipment: Shipment }) => (
  <div className="swift-card">
    <div className="flex justify-between">
      <h3 className="font-semibold text-lg">
        {shipment.carrier?.name || "N/A"} - {shipment.subcarrier?.name || "N/A"}
      </h3>
      <span className={`text-sm px-2 py-1 rounded-full ${
        shipment.status === "pending" 
          ? "bg-amber-100 text-amber-800" 
          : "bg-green-100 text-green-800"
      }`}>
        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
      </span>
    </div>
    <div className="mt-2 text-sm text-gray-600">
      <p>Driver: {shipment.driver_name}</p>
      <p>Departure: {new Date(shipment.departure_date).toLocaleDateString()}</p>
      <p>Arrival: {new Date(shipment.arrival_date).toLocaleDateString()}</p>
    </div>
    <div className="mt-4 flex justify-end">
      <Link to={`/shipments/${shipment.id}`}>
        <Button variant="outline" size="sm">View Details</Button>
      </Link>
    </div>
  </div>
);

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the active tab from URL parameters
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'pending';
  
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('shipments')
          .select(`
            id,
            driver_name,
            departure_date,
            arrival_date,
            status,
            seal_no,
            truck_reg_no,
            trailer_reg_no,
            created_at,
            carrier:carrier_id (name),
            subcarrier:subcarrier_id (name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setShipments(data || []);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast({
          title: "Error",
          description: "Failed to load shipments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchShipments();
    }
  }, [user, toast]);
  
  const handleTabChange = (value: string) => {
    navigate(`/?tab=${value}`);
  };
  
  const pendingShipments = shipments.filter(
    (shipment) => shipment.status === "pending"
  );
  
  const completedShipments = shipments.filter(
    (shipment) => shipment.status === "completed"
  );

  const filteredPendingShipments = pendingShipments.filter((shipment) => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      shipment.driver_name.toLowerCase().includes(searchTermLower) ||
      (shipment.carrier?.name.toLowerCase().includes(searchTermLower)) ||
      (shipment.subcarrier?.name.toLowerCase().includes(searchTermLower))
    );
  });

  const filteredCompletedShipments = completedShipments.filter((shipment) => {
    if (!searchTerm) return true;
    const searchTermLower = searchTerm.toLowerCase();
    return (
      shipment.driver_name.toLowerCase().includes(searchTermLower) ||
      (shipment.carrier?.name.toLowerCase().includes(searchTermLower)) ||
      (shipment.subcarrier?.name.toLowerCase().includes(searchTermLower))
    );
  });
  
  const handleSelectShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDrawerOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <DashboardOverview />
        </div>

        <div className="flex flex-col md:flex-row gap-4 my-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search shipments..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Link to="/shipments/new">
              <Button className="flex gap-2">
                <Plus className="h-4 w-4" />
                New Shipment
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex gap-2">
              Pending
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                {pendingShipments.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex gap-2">
              Completed
              <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                {completedShipments.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPendingShipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPendingShipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No pending shipments found</p>
                <Link to="/shipments/new" className="mt-4">
                  <Button>Create New Shipment</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <ShipmentTable 
              shipments={filteredCompletedShipments} 
              onSelectShipment={handleSelectShipment}
              loading={loading} 
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <ShipmentStatsDrawer 
        shipment={selectedShipment}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedShipment(null);
        }}
      />
    </AppLayout>
  );
};

export default Index;
