
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Plus } from "lucide-react";

// Mock data for dropdowns
const carriers = [
  { id: "1", name: "FedEx" },
  { id: "2", name: "UPS" },
  { id: "3", name: "DHL" },
  { id: "4", name: "Amazon" },
];

const subcarriers = [
  { id: "1", name: "Express" },
  { id: "2", name: "Ground" },
  { id: "3", name: "International" },
  { id: "4", name: "Logistics" },
];

const ShipmentNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  
  // Main form state
  const [formData, setFormData] = useState({
    carrier: "",
    subcarrier: "",
    driverName: "",
    departureDate: new Date().toISOString().split("T")[0],
    arrivalDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],  // Tomorrow
    status: "pending",
    sealNo: "",
    truckRegNo: "",
    trailerRegNo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ["carrier", "subcarrier", "driverName", "departureDate", "arrivalDate"];
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
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
      setShowDetailsForm(true);
    }, 1000);
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="carrier">Carrier*</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("carrier", value)}
                    value={formData.carrier}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select carrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {carriers.map((carrier) => (
                        <SelectItem key={carrier.id} value={carrier.id}>
                          {carrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcarrier">Subcarrier*</Label>
                  <Select 
                    onValueChange={(value) => handleSelectChange("subcarrier", value)}
                    value={formData.subcarrier}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcarrier" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcarriers.map((subcarrier) => (
                        <SelectItem key={subcarrier.id} value={subcarrier.id}>
                          {subcarrier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name*</Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sealNo">Seal No</Label>
                  <Input
                    id="sealNo"
                    name="sealNo"
                    value={formData.sealNo}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departureDate">Departure Date*</Label>
                  <Input
                    id="departureDate"
                    name="departureDate"
                    type="date"
                    value={formData.departureDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arrivalDate">Arrival Date*</Label>
                  <Input
                    id="arrivalDate"
                    name="arrivalDate"
                    type="date"
                    value={formData.arrivalDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="truckRegNo">Truck Reg No</Label>
                  <Input
                    id="truckRegNo"
                    name="truckRegNo"
                    value={formData.truckRegNo}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailerRegNo">Trailer Reg No</Label>
                  <Input
                    id="trailerRegNo"
                    name="trailerRegNo"
                    value={formData.trailerRegNo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" type="button" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Shipment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {showDetailsForm && (
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                Add detail items to this shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full py-8 border-dashed bg-muted hover:bg-muted/80">
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
