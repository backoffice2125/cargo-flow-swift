import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShipmentDetailFormProps {
  shipmentId: string;
  onCancel: () => void;
  onSave: () => void;
  isEditMode?: boolean;
  detailId?: string | null;
}

interface Customer {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

interface Format {
  id: string;
  name: string;
  service_id: string;
}

interface PriorFormat {
  id: string;
  name: string;
}

interface EcoFormat {
  id: string;
  name: string;
}

interface S3CFormat {
  id: string;
  name: string;
}

interface DOE {
  id: string;
  name: string;
}

interface ShipmentDetail {
  id: string;
  shipment_id: string;
  number_of_pallets: number;
  number_of_bags: number;
  customer_id: string | null;
  service_id: string | null;
  format_id: string | null;
  prior_format_id: string | null;
  eco_format_id: string | null;
  s3c_format_id: string | null;
  tare_weight: number;
  gross_weight: number;
  dispatch_number: string | null;
  doe_id: string | null;
}

const ShipmentDetailForm: React.FC<ShipmentDetailFormProps> = ({
  shipmentId,
  onCancel,
  onSave,
  isEditMode = false,
  detailId = null
}) => {
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(isEditMode);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [priorFormats, setPriorFormats] = useState<PriorFormat[]>([]);
  const [ecoFormats, setEcoFormats] = useState<EcoFormat[]>([]);
  const [s3cFormats, setS3CFormats] = useState<S3CFormat[]>([]);
  const [doeOptions, setDoeOptions] = useState<DOE[]>([]);
  
  const [formData, setFormData] = useState({
    number_of_pallets: 1,
    number_of_bags: 0,
    customer_id: "",
    service_id: "",
    format_id: "",
    prior_format_id: "",
    eco_format_id: "",
    s3c_format_id: "",
    tare_weight: 25.7,
    gross_weight: 0,
    dispatch_number: "",
    doe_id: ""
  });
  
  const [selectedService, setSelectedService] = useState<string>("");
  const [filteredFormats, setFilteredFormats] = useState<Format[]>([]);
  const [showBagsField, setShowBagsField] = useState(false);
  
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name')
          .order('name');
          
        if (customersError) throw customersError;
        setCustomers(customersData || []);
        
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name')
          .order('name');
          
        if (servicesError) throw servicesError;
        setServices(servicesData || []);
        
        // Find "Prio" service and set it as default
        const prioService = servicesData?.find(s => s.name === "Prio");
        if (prioService && !isEditMode) {
          setFormData(prev => ({ ...prev, service_id: prioService.id }));
          setSelectedService("Prio");
        }
        
        const { data: formatsData, error: formatsError } = await supabase
          .from('formats')
          .select('id, name, service_id')
          .order('name');
          
        if (formatsError) throw formatsError;
        setFormats(formatsData || []);
        
        const { data: priorFormatsData, error: priorFormatsError } = await supabase
          .from('prior_formats')
          .select('id, name')
          .order('name');
          
        if (priorFormatsError) throw priorFormatsError;
        setPriorFormats(priorFormatsData || []);
        
        const { data: ecoFormatsData, error: ecoFormatsError } = await supabase
          .from('eco_formats')
          .select('id, name')
          .order('name');
          
        if (ecoFormatsError) throw ecoFormatsError;
        setEcoFormats(ecoFormatsData || []);
        
        const { data: s3cFormatsData, error: s3cFormatsError } = await supabase
          .from('s3c_formats')
          .select('id, name')
          .order('name');
          
        if (s3cFormatsError) throw s3cFormatsError;
        setS3CFormats(s3cFormatsData || []);
        
        const { data: doeData, error: doeError } = await supabase
          .from('doe')
          .select('id, name')
          .order('name');
          
        if (doeError) throw doeError;
        setDoeOptions(doeData || []);
        
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        toast({
          title: "Error",
          description: "Failed to load form options. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingDropdowns(false);
      }
    };
    
    fetchDropdownData();
  }, [toast, isEditMode]);
  
  useEffect(() => {
    const fetchDetailData = async () => {
      if (!isEditMode || !detailId) return;
      
      try {
        setLoadingDetail(true);
        
        const { data, error } = await supabase
          .from('shipment_details')
          .select('*')
          .eq('id', detailId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setFormData({
            number_of_pallets: data.number_of_pallets,
            number_of_bags: data.number_of_bags,
            customer_id: data.customer_id || "",
            service_id: data.service_id || "",
            format_id: data.format_id || "",
            prior_format_id: data.prior_format_id || "",
            eco_format_id: data.eco_format_id || "",
            s3c_format_id: data.s3c_format_id || "",
            tare_weight: data.tare_weight,
            gross_weight: data.gross_weight,
            dispatch_number: data.dispatch_number || "",
            doe_id: data.doe_id || ""
          });
          
          // Set show bags field based on pallets value
          setShowBagsField(data.number_of_pallets <= 0);
          
          if (data.service_id) {
            const service = services.find(s => s.id === data.service_id);
            if (service) {
              setSelectedService(service.name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching detail data:', error);
        toast({
          title: "Error",
          description: "Failed to load detail data for editing",
          variant: "destructive",
        });
      } finally {
        setLoadingDetail(false);
      }
    };
    
    if (services.length > 0) {
      fetchDetailData();
    }
  }, [isEditMode, detailId, services, toast]);
  
  useEffect(() => {
    const selectedServiceObj = services.find(s => s.id === formData.service_id);
    if (selectedServiceObj) {
      setSelectedService(selectedServiceObj.name);
      
      const filtered = formats.filter(f => f.service_id === formData.service_id);
      setFilteredFormats(filtered);
      
      if (selectedServiceObj.name !== 'Prior') {
        setFormData(prev => ({ ...prev, prior_format_id: "" }));
      }
      if (selectedServiceObj.name !== 'Eco') {
        setFormData(prev => ({ ...prev, eco_format_id: "" }));
      }
      if (selectedServiceObj.name !== 'S3C') {
        setFormData(prev => ({ ...prev, s3c_format_id: "" }));
      }
      if (selectedServiceObj.name !== 'Standard' && selectedServiceObj.name !== 'Other') {
        setFormData(prev => ({ ...prev, format_id: "" }));
      }
    } else {
      setSelectedService("");
      setFilteredFormats([]);
    }
  }, [formData.service_id, services, formats]);
  
  // Handle pallets value change to show/hide bags field
  useEffect(() => {
    const palletsValue = formData.number_of_pallets;
    
    if (palletsValue <= 0) {
      setShowBagsField(true);
      // Reset tare weight when switching to bags
      setFormData(prev => {
        // Calculate tare weight based on bags
        const bagsWeight = prev.number_of_bags * 0.125;
        return { ...prev, tare_weight: Number(bagsWeight.toFixed(3)) };
      });
    } else {
      setShowBagsField(false);
      // Reset to default tare weight when using pallets
      setFormData(prev => ({ ...prev, tare_weight: 25.7, number_of_bags: 0 }));
    }
  }, [formData.number_of_pallets]);
  
  // Handle bags value change to update tare weight
  useEffect(() => {
    if (showBagsField && formData.number_of_bags >= 0) {
      const bagsWeight = formData.number_of_bags * 0.125;
      setFormData(prev => ({ ...prev, tare_weight: Number(bagsWeight.toFixed(3)) }));
    }
  }, [formData.number_of_bags, showBagsField]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      const numValue = value === '' ? 0 : Number(value);
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ["customer_id", "service_id", "gross_weight"];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing required fields",
        description: `Please fill in all required fields: ${missingFields.map(field => field.replace('_id', '')).join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    
    if (selectedService === 'Prior' && !formData.prior_format_id) {
      toast({
        title: "Missing required field",
        description: "Please select a Prior Format",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedService === 'Eco' && !formData.eco_format_id) {
      toast({
        title: "Missing required field",
        description: "Please select an Eco Format",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedService === 'S3C' && !formData.s3c_format_id) {
      toast({
        title: "Missing required field",
        description: "Please select a S3C Format",
        variant: "destructive",
      });
      return;
    }
    
    if ((selectedService === 'Standard' || selectedService === 'Other') && !formData.format_id) {
      toast({
        title: "Missing required field",
        description: "Please select a Format",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const dataToSave = {
        ...formData,
        shipment_id: shipmentId,
        format_id: formData.format_id || null,
        prior_format_id: formData.prior_format_id || null,
        eco_format_id: formData.eco_format_id || null,
        s3c_format_id: formData.s3c_format_id || null,
        doe_id: formData.doe_id || null
      };
      
      if (isEditMode && detailId) {
        const { error } = await supabase
          .from('shipment_details')
          .update(dataToSave)
          .eq('id', detailId);
          
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Shipment detail updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('shipment_details')
          .insert([dataToSave]);
          
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Shipment detail added successfully",
        });
      }
      
      // Call onSave to update the parent component and show the new entry
      onSave();
    } catch (error: any) {
      console.error('Error saving shipment detail:', error);
      toast({
        title: "Error",
        description: isEditMode 
          ? `Failed to update shipment detail: ${error.message}` 
          : `Failed to add shipment detail: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loadingDropdowns || loadingDetail) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer*</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("customer_id", value)}
                value={formData.customer_id}
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
              <Label htmlFor="service_id">Service*</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("service_id", value)}
                value={formData.service_id}
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
            
            {(selectedService === 'Standard' || selectedService === 'Other') && (
              <div className="space-y-2">
                <Label htmlFor="format_id">Format*</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("format_id", value)}
                  value={formData.format_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedService === 'Prior' && (
              <div className="space-y-2">
                <Label htmlFor="prior_format_id">Prior Format*</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("prior_format_id", value)}
                  value={formData.prior_format_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prior format" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedService === 'Eco' && (
              <div className="space-y-2">
                <Label htmlFor="eco_format_id">Eco Format*</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("eco_format_id", value)}
                  value={formData.eco_format_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select eco format" />
                  </SelectTrigger>
                  <SelectContent>
                    {ecoFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {selectedService === 'S3C' && (
              <div className="space-y-2">
                <Label htmlFor="s3c_format_id">S3C Format*</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("s3c_format_id", value)}
                  value={formData.s3c_format_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select S3C format" />
                  </SelectTrigger>
                  <SelectContent>
                    {s3cFormats.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {!showBagsField && (
              <div className="space-y-2">
                <Label htmlFor="number_of_pallets">Number of Pallets</Label>
                <Input
                  id="number_of_pallets"
                  name="number_of_pallets"
                  type="number"
                  min="0"
                  value={formData.number_of_pallets}
                  onChange={handleChange}
                />
              </div>
            )}
            
            {showBagsField && (
              <div className="space-y-2">
                <Label htmlFor="number_of_bags">Number of Bags</Label>
                <Input
                  id="number_of_bags"
                  name="number_of_bags"
                  type="number"
                  min="0"
                  value={formData.number_of_bags}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="gross_weight">Gross Weight (kg)*</Label>
              <Input
                id="gross_weight"
                name="gross_weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.gross_weight}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tare_weight">Tare Weight (kg)</Label>
              <Input
                id="tare_weight"
                name="tare_weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.tare_weight}
                onChange={showBagsField ? undefined : handleChange}
                readOnly={showBagsField}
                className={showBagsField ? "bg-muted cursor-not-allowed" : ""}
              />
              <p className="text-xs text-muted-foreground">
                {showBagsField 
                  ? "Auto-calculated based on number of bags (0.125 kg per bag)" 
                  : "Default value for pallets: 25.7 kg"}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dispatch_number">Dispatch Number</Label>
              <Input
                id="dispatch_number"
                name="dispatch_number"
                type="text"
                uppercase={false}
                value={formData.dispatch_number}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doe_id">DOE</Label>
              <Select 
                onValueChange={(value) => handleSelectChange("doe_id", value)}
                value={formData.doe_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select DOE" />
                </SelectTrigger>
                <SelectContent>
                  {doeOptions.length > 0 ? (
                    doeOptions.map((doe) => (
                      <SelectItem key={doe.id} value={doe.id || "none-available"}>
                        {doe.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-options-available">No options available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Update Detail" : "Add Detail"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShipmentDetailForm;
