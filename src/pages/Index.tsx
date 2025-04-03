
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, TrendingUp, Truck, Package } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";

// Mock data for shipments
const mockShipments = [
  {
    id: "1",
    carrier: "FedEx",
    subcarrier: "Express",
    driverName: "John Doe",
    departureDate: "2023-04-01",
    arrivalDate: "2023-04-02",
    status: "pending",
    sealNo: "SL12345",
    truckRegNo: "TR5678",
    trailerRegNo: "TL9012",
    createdAt: "2023-03-31",
  },
  {
    id: "2",
    carrier: "UPS",
    subcarrier: "Ground",
    driverName: "Jane Smith",
    departureDate: "2023-04-02",
    arrivalDate: "2023-04-03",
    status: "pending",
    sealNo: "SL67890",
    truckRegNo: "TR1234",
    trailerRegNo: "TL5678",
    createdAt: "2023-04-01",
  },
  {
    id: "3",
    carrier: "DHL",
    subcarrier: "International",
    driverName: "Bob Johnson",
    departureDate: "2023-03-29",
    arrivalDate: "2023-03-30",
    status: "completed",
    sealNo: "SL54321",
    truckRegNo: "TR9876",
    trailerRegNo: "TL5432",
    createdAt: "2023-03-28",
  },
  {
    id: "4",
    carrier: "Amazon",
    subcarrier: "Logistics",
    driverName: "Sarah Wilson",
    departureDate: "2023-03-30",
    arrivalDate: "2023-03-31",
    status: "completed",
    sealNo: "SL13579",
    truckRegNo: "TR2468",
    trailerRegNo: "TL1357",
    createdAt: "2023-03-29",
  },
];

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend?: string }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          {trend && (
            <div className="flex items-center mt-1 text-swift-teal-500 text-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className="p-2 bg-swift-blue-100 rounded-md text-swift-blue-500">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ShipmentCard = ({ shipment }: { shipment: any }) => (
  <div className="swift-card">
    <div className="flex justify-between">
      <h3 className="font-semibold text-lg">{shipment.carrier} - {shipment.subcarrier}</h3>
      <span className={`text-sm px-2 py-1 rounded-full ${
        shipment.status === "pending" 
          ? "bg-amber-100 text-amber-800" 
          : "bg-green-100 text-green-800"
      }`}>
        {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
      </span>
    </div>
    <div className="mt-2 text-sm text-gray-600">
      <p>Driver: {shipment.driverName}</p>
      <p>Departure: {new Date(shipment.departureDate).toLocaleDateString()}</p>
      <p>Arrival: {new Date(shipment.arrivalDate).toLocaleDateString()}</p>
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
  
  const pendingShipments = mockShipments.filter(
    (shipment) => shipment.status === "pending"
  );
  
  const completedShipments = mockShipments.filter(
    (shipment) => shipment.status === "completed"
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Link to="/shipments/new">
            <Button className="swift-button-primary">
              <Plus className="h-4 w-4 mr-2" />
              New Shipment
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Pending Shipments" 
            value={pendingShipments.length.toString()} 
            icon={<Truck className="h-5 w-5" />} 
            trend="+5% from last week"
          />
          <StatCard 
            title="Total Completed Shipments" 
            value={completedShipments.length.toString()} 
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard 
            title="Total Weight Shipped" 
            value="1,254 kg" 
            icon={<TrendingUp className="h-5 w-5" />}
          />
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
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex gap-2">
              Pending
              <span className="bg-swift-blue-100 text-swift-blue-800 px-2 py-0.5 rounded-full text-xs">
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
            {pendingShipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingShipments.map((shipment) => (
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
            {completedShipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedShipments.map((shipment) => (
                  <ShipmentCard key={shipment.id} shipment={shipment} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No completed shipments found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Index;
