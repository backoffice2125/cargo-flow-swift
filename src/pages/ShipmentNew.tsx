import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Carrier {
  id: string;
  name: string;
}

interface Subcarrier {
  id: string;
  name: string;
}

const ShipmentNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [currentShipmentId, setCurrentShipmentId] = useState<string | null>(null);
  
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [subcarriers, setSubcarriers] = useState<Subcarrier[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    carrier_id: "",
    subcarrier_id: "",
    driver_name: "",
    departure_date: new Date().toISOString().split("T")[0],
    arrival_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],  
    status: "pending",
    seal_no: "",
    truck_reg_no: "",
    trailer_reg_no: "",
  });

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoading(true);
        
        const { data: carriersData, error: carriersError } = await supabase
          .from('carriers')
          .select('id, name')
          .order('name');
          
        if (carriersError) throw carriersError;
        setCarriers(carriersData || []);
        
        const { data: subcarriersData, error: subcarriersError } = await supabase
          .from('subcarriers')
          .select('id, name')
          .order('name');
          
        if (subcarriersError) throw subcarriersError;
        setSubcarriers(subcarriersData || []);
        
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast({
          title: "Error",
          description: "Failed to load dropdown options. Please refresh and try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDropdownData();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create shipments.",
        variant: "destructive",
      });
      return;
    }
    
    const requiredFields = ["carrier_id", "subcarrier_id", "driver_name", "departure_date", "arrival_date"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in all required fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('shipments')
        .insert([
          {
            ...formData,
            created_by: user.id
          }
        ])
        .select('id')
        .single();
      
      if (error) throw error;
      
      setCurrentShipmentId(data.id);
      setShowDetailsForm(true);
      
      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: "Failed to create shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">New Shipment</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Main Shipment Information</CardTitle>
            <CardDescription>
              Fill in the details for the new shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="carrier_id">Carrier*</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("carrier_id", value)}
                      value={formData.carrier_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {carriers.length > 0 ? (
                          carriers.map((carrier) => (
                            <SelectItem key={carrier.id} value={carrier.id}>
                              {carrier.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-carriers-available">No carriers available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subcarrier_id">Subcarrier*</Label>
                    <Select 
                      onValueChange={(value) => handleSelectChange("subcarrier_id", value)}
                      value={formData.subcarrier_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcarrier" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcarriers.length > 0 ? (
                          subcarriers.map((subcarrier) => (
                            <SelectItem key={subcarrier.id} value={subcarrier.id}>
                              {subcarrier.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-subcarriers-available">No subcarriers available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="driver_name">Driver Name*</Label>
                    <Input
                      id="driver_name"
                      name="driver_name"
                      value={formData.driver_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seal_no">Seal No</Label>
                    <Input
                      id="seal_no"
                      name="seal_no"
                      value={formData.seal_no}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departure_date">Departure Date*</Label>
                    <Input
                      id="departure_date"
                      name="departure_date"
                      type="date"
                      value={formData.departure_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival_date">Arrival Date*</Label>
                    <Input
                      id="arrival_date"
                      name="arrival_date"
                      type="date"
                      value={formData.arrival_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="truck_reg_no">Truck Reg No</Label>
                    <Input
                      id="truck_reg_no"
                      name="truck_reg_no"
                      value={formData.truck_reg_no}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailer_reg_no">Trailer Reg No</Label>
                    <Input
                      id="trailer_reg_no"
                      name="trailer_reg_no"
                      value={formData.trailer_reg_no}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => navigate("/")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || loading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Shipment"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {showDetailsForm && currentShipmentId && (
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                Add detail items to this shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full py-8 border-dashed bg-muted hover:bg-muted/80"
                onClick={() => navigate(`/shipments/${currentShipmentId}`)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Shipment Detail
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ShipmentNew;
