import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Plus, Trash, Edit, FilePlus, FileText, Clipboard } from "lucide-react";
import { usePDF } from "@/contexts/PDFContext";

const customers = [
  { id: "1", name: "Asendia A/C" },
  { id: "2", name: "DHL" },
  { id: "3", name: "UPS" },
  { id: "4", name: "FedEx" },
];

const services = [
  { id: "1", name: "Prior" },
  { id: "2", name: "Eco" },
  { id: "3", name: "S3C" },
];

const priorFormats = [
  { id: "1", name: "Format A" },
  { id: "2", name: "Format B" },
];

const ecoFormats = [
  { id: "1", name: "Eco Format 1" },
  { id: "2", name: "Eco Format 2" },
];

const s3cFormats = [
  { id: "1", name: "S3C Format A" },
  { id: "2", name: "S3C Format B" },
];

const doeOptions = [
  { id: "1", name: "Option 1" },
  { id: "2", name: "Option 2" },
  { id: "3", name: "Option 3" },
];

interface DetailFormData {
  id: string;
  pallets: number;
  bags: number;
  customer: string;
  service: string;
  format: string;
  tareWeight: number;
  grossWeight: number;
  dispatchNumber: string;
  doe: string;
}

const ShipmentDetailForm = ({ onSave, onCancel }: { onSave: (data: DetailFormData) => void; onCancel: () => void }) => {
  const [detailData, setDetailData] = useState<DetailFormData>({
    id: Date.now().toString(),
    pallets: 1,
    bags: 0,
    customer: "",
    service: "",
    format: "",
    tareWeight: 25.7,
    grossWeight: 0,
    dispatchNumber: "",
    doe: "",
  });
  
  const [selectedService, setSelectedService] = useState("");
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "pallets" || name === "bags" || name === "tareWeight" || name === "grossWeight") {
      const numValue = parseFloat(value) || 0;
      
      if (name === "bags") {
        const newTareWeight = numValue > 0 ? 25.7 + (numValue * 0.125) : 25.7;
        setDetailData({ 
          ...detailData, 
          [name]: numValue,
          tareWeight: parseFloat(newTareWeight.toFixed(2))
        });
        return;
      }
      
      setDetailData({ ...detailData, [name]: numValue });
      return;
    }
    
    setDetailData({ ...detailData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "service") {
      setSelectedService(value);
      setDetailData({ ...detailData, [name]: value, format: "" });
    } else {
      setDetailData({ ...detailData, [name]: value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(detailData);
  };

  const getFormatOptions = () => {
    switch (selectedService) {
      case "1": // Prior
        return priorFormats;
      case "2": // Eco
        return ecoFormats;
      case "3": // S3C
        return s3cFormats;
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="pallets">Number of Pallets</Label>
          <Input
            id="pallets"
            name="pallets"
            type="number"
            min="1"
            value={detailData.pallets}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bags">Number of Bags</Label>
          <Input
            id="bags"
            name="bags"
            type="number"
            min="0"
            value={detailData.bags}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Select 
            onValueChange={(value) => handleSelectChange("customer", value)}
            value={detailData.customer}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <Select 
            onValueChange={(value) => handleSelectChange("service", value)}
            value={detailData.service}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedService && (
          <div className="space-y-2">
            <Label htmlFor="format">{selectedService === "1" ? "Prior Format" : selectedService === "2" ? "Eco Format" : "S3C Format"}</Label>
            <Select 
              onValueChange={(value) => handleSelectChange("format", value)}
              value={detailData.format}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Select ${selectedService === "1" ? "prior" : selectedService === "2" ? "eco" : "S3C"} format`} />
              </SelectTrigger>
              <SelectContent>
                {getFormatOptions().map((format) => (
                  <SelectItem key={format.id} value={format.id}>
                    {format.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="tareWeight">Tare Weight (kg)</Label>
          <Input
            id="tareWeight"
            name="tareWeight"
            type="number"
            step="0.01"
            value={detailData.tareWeight}
            onChange={handleChange}
            disabled
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
          <Input
            id="grossWeight"
            name="grossWeight"
            type="number"
            step="0.01"
            value={detailData.grossWeight}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dispatchNumber">Dispatch Number</Label>
          <Input
            id="dispatchNumber"
            name="dispatchNumber"
            value={detailData.dispatchNumber}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doe">DOE</Label>
          <Select 
            onValueChange={(value) => handleSelectChange("doe", value)}
            value={detailData.doe}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select DOE option" />
            </SelectTrigger>
            <SelectContent>
              {doeOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Detail
        </Button>
      </div>
    </form>
  );
};

const ShipmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [details, setDetails] = useState<DetailFormData[]>([]);
  const [totals, setTotals] = useState({
    grossWeight: 0,
    tareWeight: 0,
    netWeight: 0,
    pallets: 0,
    bags: 0,
  });

  const shipment = {
    id: id || "1",
    carrier: "FedEx",
    subcarrier: "Express",
    driverName: "John Doe",
    departureDate: "2023-04-01",
    arrivalDate: "2023-04-02",
    status: "pending",
    sealNo: "SL12345",
    truckRegNo: "TR5678",
    trailerRegNo: "TL9012",
  };

  const calculateTotals = (detailsArray: DetailFormData[]) => {
    const newTotals = {
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0,
      pallets: 0,
      bags: 0,
    };

    detailsArray.forEach(detail => {
      newTotals.grossWeight += detail.grossWeight;
      newTotals.tareWeight += detail.tareWeight;
      newTotals.pallets += detail.pallets;
      newTotals.bags += detail.bags;
    });

    newTotals.netWeight = newTotals.grossWeight - newTotals.tareWeight;
    
    setTotals(newTotals);
  };

  const handleSaveDetail = (data: DetailFormData) => {
    const newDetails = [...details, data];
    setDetails(newDetails);
    calculateTotals(newDetails);
    setShowDetailForm(false);
    
    toast({
      title: "Success",
      description: "Shipment detail added successfully",
    });
  };

  const handleDeleteDetail = (id: string) => {
    const newDetails = details.filter(detail => detail.id !== id);
    setDetails(newDetails);
    calculateTotals(newDetails);
    
    toast({
      title: "Detail removed",
      description: "Shipment detail has been removed",
    });
  };

  const handleCompleteShipment = () => {
    toast({
      title: "Shipment Completed",
      description: "The shipment has been marked as completed",
    });
    
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  const { generatePreAlertPDF, generateCMRPDF, loading: pdfLoading } = usePDF();

  const handleGeneratePreAlertPDF = async () => {
    if (!id) return;
    await generatePreAlertPDF(id);
  };
  
  const handleGenerateCMRPDF = async () => {
    if (!id) return;
    await generateCMRPDF(id);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Shipment {id}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shipment Information</CardTitle>
            <CardDescription>
              View and manage this shipment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Carrier</p>
                <p className="font-medium">{shipment.carrier} - {shipment.subcarrier}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="font-medium">{shipment.driverName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departure Date</p>
                <p className="font-medium">{new Date(shipment.departureDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival Date</p>
                <p className="font-medium">{new Date(shipment.arrivalDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seal No</p>
                <p className="font-medium">{shipment.sealNo || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    shipment.status === "pending" 
                      ? "bg-amber-100 text-amber-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Truck Reg No</p>
                <p className="font-medium">{shipment.truckRegNo || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trailer Reg No</p>
                <p className="font-medium">{shipment.trailerRegNo || "-"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Pallets</p>
                <p className="text-2xl font-bold mt-1">{totals.pallets}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Bags</p>
                <p className="text-2xl font-bold mt-1">{totals.bags}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Gross Weight</p>
                <p className="text-2xl font-bold mt-1">{totals.grossWeight.toFixed(2)} kg</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tare Weight</p>
                <p className="text-2xl font-bold mt-1">{totals.tareWeight.toFixed(2)} kg</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Net Weight</p>
                <p className="text-2xl font-bold mt-1">{totals.netWeight.toFixed(2)} kg</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                View and manage detailed items in this shipment
              </CardDescription>
            </div>
            <Button onClick={() => setShowDetailForm(true)} disabled={showDetailForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Detail
            </Button>
          </CardHeader>
          <CardContent>
            {showDetailForm ? (
              <ShipmentDetailForm 
                onSave={handleSaveDetail} 
                onCancel={() => setShowDetailForm(false)} 
              />
            ) : details.length > 0 ? (
              <div className="space-y-4">
                {details.map((detail) => (
                  <div key={detail.id} className="p-4 border rounded-md">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">
                        {customers.find(c => c.id === detail.customer)?.name || "Customer"} - 
                        {services.find(s => s.id === detail.service)?.name || "Service"}
                      </h3>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDetail(detail.id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Pallets</p>
                        <p className="text-sm">{detail.pallets}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bags</p>
                        <p className="text-sm">{detail.bags}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gross Weight</p>
                        <p className="text-sm">{detail.grossWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tare Weight</p>
                        <p className="text-sm">{detail.tareWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Net Weight</p>
                        <p className="text-sm">{(detail.grossWeight - detail.tareWeight).toFixed(2)} kg</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Dispatch Number</p>
                        <p className="text-sm">{detail.dispatchNumber || "-"}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-4 mt-6">
                  <Button variant="outline" onClick={() => navigate("/")}>
                    Back to Dashboard
                  </Button>
                  <Button className="bg-swift-teal-500 hover:bg-swift-teal-600" onClick={handleCompleteShipment}>
                    Mark as Completed
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No details added to this shipment yet</p>
                <Button onClick={() => setShowDetailForm(true)} className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Detail
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Document Generation</CardTitle>
              <CardDescription>
                Generate shipment documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FilePlus className="h-6 w-6 mb-2" />
                  <span>Generate Pre-Alert PDF</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center">
                  <FilePlus className="h-6 w-6 mb-2" />
                  <span>Generate CMR PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {shipment.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>
                Generated documents for this shipment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-6 px-6 flex flex-col items-center gap-2"
                  onClick={handleGeneratePreAlertPDF}
                  disabled={pdfLoading}
                >
                  <FileText className="h-8 w-8" />
                  <span>Pre-Alert PDF</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-6 px-6 flex flex-col items-center gap-2"
                  onClick={handleGenerateCMRPDF}
                  disabled={pdfLoading}
                >
                  <Clipboard className="h-8 w-8" />
                  <span>CMR PDF</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ShipmentDetails;
