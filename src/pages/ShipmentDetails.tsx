import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Plus, Trash, Edit, FilePlus, Loader2, Pencil, ChevronRight, ChevronDown, Save, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ShipmentDetailForm from "@/components/shipments/ShipmentDetailForm";
import ShipmentDetailItem from "@/components/shipments/ShipmentDetailItem";
import { usePDF } from "@/contexts/PDFContext";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";

interface Shipment {
  id: string;
  carrier_id: string;
  subcarrier_id: string;
  driver_name: string;
  departure_date: string;
  arrival_date: string;
  status: string;
  seal_no: string | null;
  truck_reg_no: string | null;
  trailer_reg_no: string | null;
  carrier: {
    name: string;
    id: string;
  } | null;
  subcarrier: {
    name: string;
    id: string;
  } | null;
}

interface ShipmentDetail {
  id: string;
  shipment_id: string;
  number_of_pallets: number;
  number_of_bags: number;
  customer_id: string;
  service_id: string;
  format_id: string | null;
  prior_format_id: string | null;
  eco_format_id: string | null;
  s3c_format_id: string | null;
  tare_weight: number;
  gross_weight: number;
  net_weight: number;
  dispatch_number: string | null;
  doe_id: string | null;
  customer: {
    name: string;
    is_asendia: boolean;
  } | null;
  service: {
    name: string;
  } | null;
  format: {
    name: string;
  } | null;
  prior_format: {
    name: string;
  } | null;
  eco_format: {
    name: string;
  } | null;
  s3c_format: {
    name: string;
  } | null;
  doe: {
    name: string;
  } | null;
}

interface Carrier {
  id: string;
  name: string;
}

const ShipmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [details, setDetails] = useState<ShipmentDetail[]>([]);
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [editingDetailId, setEditingDetailId] = useState<string | null>(null);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [deleteDetailId, setDeleteDetailId] = useState<string | null>(null);
  const [completeAlertOpen, setCompleteAlertOpen] = useState(false);
  const [deleteShipmentAlertOpen, setDeleteShipmentAlertOpen] = useState(false);
  const [editShipmentMode, setEditShipmentMode] = useState(false);
  const [editedShipment, setEditedShipment] = useState<Partial<Shipment>>({});
  const [expandedDetails, setExpandedDetails] = useState<{ [key: string]: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [subcarriers, setSubcarriers] = useState<Carrier[]>([]);
  const [showAllDetails, setShowAllDetails] = useState(false);
  
  // Add missing state variables for batch deletion
  const [selectedDetails, setSelectedDetails] = useState<Set<string>>(new Set());
  const [batchDeleteAlertOpen, setBatchDeleteAlertOpen] = useState(false);
  
  const [totals, setTotals] = useState({
    grossWeight: 0,
    tareWeight: 0,
    netWeight: 0,
    pallets: 0,
    bags: 0,
    asendiaNetWeight: 0,
    otherNetWeight: 0
  });

  const { generatePreAlertPDF, generateCMRPDF, loading: pdfLoading } = usePDF();

  // Display maximum 5 detail items by default
  const visibleDetails = showAllDetails ? details : details.slice(0, 5);
  const hasMoreDetails = details.length > 5;

  const fetchShipmentData = async () => {
    if (!id) return;

    setIsLoading(true);
    
    try {
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select(`
          *,
          carrier:carrier_id(id, name),
          subcarrier:subcarrier_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (shipmentError) throw shipmentError;
      setShipment(shipmentData);
      setEditedShipment({
        driver_name: shipmentData.driver_name,
        status: shipmentData.status,
        carrier_id: shipmentData.carrier_id,
        subcarrier_id: shipmentData.subcarrier_id,
        departure_date: shipmentData.departure_date,
        arrival_date: shipmentData.arrival_date,
        seal_no: shipmentData.seal_no,
        truck_reg_no: shipmentData.truck_reg_no,
        trailer_reg_no: shipmentData.trailer_reg_no,
      });
      
      const { data: carriersData, error: carriersError } = await supabase
        .from('carriers')
        .select('*')
        .order('name', { ascending: true });
        
      if (carriersError) throw carriersError;
      setCarriers(carriersData || []);
      
      const { data: subcarriersData, error: subcarriersError } = await supabase
        .from('subcarriers')
        .select('*')
        .order('name', { ascending: true });
        
      if (subcarriersError) throw subcarriersError;
      setSubcarriers(subcarriersData || []);
      
      const { data: detailsData, error: detailsError } = await supabase
        .from('shipment_details')
        .select(`
          *,
          customer:customer_id(name, is_asendia),
          service:service_id(name),
          format:format_id(name),
          prior_format:prior_format_id(name),
          eco_format:eco_format_id(name),
          s3c_format:s3c_format_id(name),
          doe:doe_id(name)
        `)
        .eq('shipment_id', id)
        .order('created_at', { ascending: true });
        
      if (detailsError) throw detailsError;
      setDetails(detailsData || []);
      
      const initialExpanded: { [key: string]: boolean } = {};
      detailsData?.forEach(detail => {
        initialExpanded[detail.id] = true;
      });
      setExpandedDetails(initialExpanded);
      
      calculateTotals(detailsData || []);
    } catch (error) {
      console.error('Error fetching shipment data:', error);
      toast({
        title: "Error",
        description: "Failed to load shipment data",
        variant: "destructive",
      });
      
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipmentData();

    const channel = supabase
      .channel('shipment-details-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'shipment_details', filter: `shipment_id=eq.${id}` },
          (payload) => {
            fetchShipmentData();
          }
      )
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'shipments', filter: `id=eq.${id}` },
          (payload) => {
            fetchShipmentData();
          }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, navigate, toast]);

  const calculateTotals = (detailsArray: ShipmentDetail[]) => {
    const newTotals = {
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0,
      pallets: 0,
      bags: 0,
      asendiaNetWeight: 0,
      otherNetWeight: 0
    };

    detailsArray.forEach(detail => {
      newTotals.grossWeight += detail.gross_weight;
      newTotals.tareWeight += detail.tare_weight;
      newTotals.netWeight += detail.net_weight;
      newTotals.pallets += detail.number_of_pallets;
      newTotals.bags += detail.number_of_bags;
      
      if (detail.customer?.is_asendia) {
        newTotals.asendiaNetWeight += detail.net_weight;
      } else {
        newTotals.otherNetWeight += detail.net_weight;
      }
    });
    
    setTotals(newTotals);
  };

  const handleSaveDetail = () => {
    // After saving a detail, immediately fetch updated data
    fetchShipmentData();
    setShowDetailForm(false);
    setEditingDetailId(null);
  };

  const handleEditDetail = (detailId: string) => {
    setEditingDetailId(detailId);
    setShowDetailForm(true);
  };

  const handleDeleteDetail = (detailId: string) => {
    setDeleteDetailId(detailId);
    setDeleteAlertOpen(true);
  };

  const confirmDeleteDetail = async () => {
    if (!deleteDetailId) return;
    
    try {
      const { error } = await supabase
        .from('shipment_details')
        .delete()
        .eq('id', deleteDetailId);
        
      if (error) throw error;
      
      toast({
        title: "Detail deleted",
        description: "Shipment detail has been removed",
      });
      
      // Immediately update the list after deletion
      fetchShipmentData();
    } catch (error) {
      console.error('Error deleting detail:', error);
      toast({
        title: "Error",
        description: "Failed to delete the shipment detail",
        variant: "destructive",
      });
    } finally {
      setDeleteAlertOpen(false);
      setDeleteDetailId(null);
    }
  };

  const handleCompleteShipment = () => {
    if (details.length === 0) {
      toast({
        title: "Cannot complete shipment",
        description: "Add at least one detail item before completing the shipment",
        variant: "destructive",
      });
      return;
    }
    
    setCompleteAlertOpen(true);
  };

  const confirmCompleteShipment = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'completed' })
        .eq('id', id);
        
      if (error) throw error;
      
      if (shipment) {
        setShipment({ ...shipment, status: 'completed' });
      }
      
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: user?.id,
          shipment_id: id,
          action: 'complete_shipment',
          new_data: { status: 'completed' }
        }]);
        
      toast({
        title: "Shipment completed",
        description: "The shipment has been marked as completed",
      });
    } catch (error) {
      console.error('Error completing shipment:', error);
      toast({
        title: "Error",
        description: "Failed to mark the shipment as completed",
        variant: "destructive",
      });
    } finally {
      setCompleteAlertOpen(false);
    }
  };

  const handleEditShipment = () => {
    if (!shipment) return;
    
    setEditedShipment({
      driver_name: shipment.driver_name,
      status: shipment.status,
      carrier_id: shipment.carrier_id,
      subcarrier_id: shipment.subcarrier_id,
      departure_date: shipment.departure_date,
      arrival_date: shipment.arrival_date,
      seal_no: shipment.seal_no,
      truck_reg_no: shipment.truck_reg_no,
      trailer_reg_no: shipment.trailer_reg_no,
    });
    setEditShipmentMode(true);
  };

  const handleCancelEdit = () => {
    if (!shipment) return;
    
    setEditedShipment({
      driver_name: shipment.driver_name,
      status: shipment.status,
      carrier_id: shipment.carrier_id,
      subcarrier_id: shipment.subcarrier_id,
      departure_date: shipment.departure_date,
      arrival_date: shipment.arrival_date,
      seal_no: shipment.seal_no,
      truck_reg_no: shipment.truck_reg_no,
      trailer_reg_no: shipment.trailer_reg_no,
    });
    setEditShipmentMode(false);
  };

  const handleSaveShipmentChanges = async () => {
    if (!id || !shipment) return;
    
    setIsSaving(true);
    
    try {
      const dataToUpdate = {
        driver_name: editedShipment.driver_name,
        status: editedShipment.status,
        carrier_id: editedShipment.carrier_id === 'none' ? null : editedShipment.carrier_id,
        subcarrier_id: editedShipment.subcarrier_id === 'none' ? null : editedShipment.subcarrier_id,
        departure_date: editedShipment.departure_date,
        arrival_date: editedShipment.arrival_date,
        seal_no: editedShipment.seal_no,
        truck_reg_no: editedShipment.truck_reg_no,
        trailer_reg_no: editedShipment.trailer_reg_no,
      };
      
      const { error } = await supabase
        .from('shipments')
        .update(dataToUpdate)
        .eq('id', id);
        
      if (error) throw error;
      
      const { data: updatedShipment, error: fetchError } = await supabase
        .from('shipments')
        .select(`
          *,
          carrier:carrier_id(id, name),
          subcarrier:subcarrier_id(id, name)
        `)
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      setShipment(updatedShipment);
      
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: user?.id,
          shipment_id: id,
          action: 'edit_shipment',
          old_data: {
            driver_name: shipment.driver_name,
            status: shipment.status,
            carrier_id: shipment.carrier_id,
            subcarrier_id: shipment.subcarrier_id,
            departure_date: shipment.departure_date,
            arrival_date: shipment.arrival_date,
            seal_no: shipment.seal_no,
            truck_reg_no: shipment.truck_reg_no,
            trailer_reg_no: shipment.trailer_reg_no,
          },
          new_data: editedShipment
        }]);
      
      toast({
        title: "Shipment updated",
        description: "The shipment has been updated successfully",
      });
      
      setEditShipmentMode(false);
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: "Error",
        description: "Failed to update the shipment",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteShipment = () => {
    if (details.length > 0) {
      toast({
        title: "Cannot delete shipment",
        description: "You must delete all shipment details before deleting the shipment",
        variant: "destructive",
      });
      return;
    }
    
    setDeleteShipmentAlertOpen(true);
  };

  const confirmDeleteShipment = async () => {
    if (!id) return;
    
    try {
      const { data: detailsData, error: countError } = await supabase
        .from('shipment_details')
        .select('id', { count: 'exact', head: true })
        .eq('shipment_id', id);
      
      if (countError) throw countError;
      
      if ((detailsData?.length || 0) > 0) {
        toast({
          title: "Cannot delete shipment",
          description: "You must delete all shipment details before deleting the shipment",
          variant: "destructive",
        });
        setDeleteShipmentAlertOpen(false);
        return;
      }
      
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: user?.id,
          action: 'delete_shipment',
          old_data: { id, status: shipment?.status }
        }]);
      
      toast({
        title: "Shipment deleted",
        description: "The shipment has been deleted successfully",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error deleting shipment:', error);
      toast({
        title: "Error",
        description: "Failed to delete the shipment",
        variant: "destructive",
      });
    } finally {
      setDeleteShipmentAlertOpen(false);
    }
  };

  const handleGeneratePreAlertPDF = async () => {
    if (!id) return;
    await generatePreAlertPDF(id);
  };

  const handleGenerateCMRPDF = async () => {
    if (!id) return;
    await generateCMRPDF(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedShipment(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedShipment(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setEditedShipment(prev => ({ ...prev, [name]: format(date, 'yyyy-MM-dd') }));
    }
  };

  const toggleDetailExpand = (detailId: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [detailId]: !prev[detailId]
    }));
  };

  const toggleShowAllDetails = () => {
    setShowAllDetails(prev => !prev);
  };

  const handleSelectDetail = (detailId: string, isSelected: boolean) => {
    setSelectedDetails(prev => {
      const updated = new Set(prev);
      if (isSelected) {
        updated.add(detailId);
      } else {
        updated.delete(detailId);
      }
      return updated;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<string>();
      visibleDetails.forEach(detail => {
        allIds.add(detail.id);
      });
      setSelectedDetails(allIds);
    } else {
      setSelectedDetails(new Set());
    }
  };

  const handleBatchDelete = () => {
    if (selectedDetails.size === 0) return;
    setBatchDeleteAlertOpen(true);
  };

  const confirmBatchDelete = async () => {
    if (selectedDetails.size === 0) return;
    
    setIsSaving(true);
    
    try {
      // Delete each selected detail
      const promises = Array.from(selectedDetails).map(detailId => {
        return supabase
          .from('shipment_details')
          .delete()
          .eq('id', detailId);
      });
      
      await Promise.all(promises);
      
      toast({
        title: "Details deleted",
        description: `${selectedDetails.size} shipment details have been removed`,
      });
      
      // Clear selection and refresh data
      setSelectedDetails(new Set());
      fetchShipmentData();
    } catch (error) {
      console.error('Error deleting details:', error);
      toast({
        title: "Error",
        description: "Failed to delete the selected shipment details",
        variant: "destructive",
      });
    } finally {
      setBatchDeleteAlertOpen(false);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (!shipment) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px]">
          <h2 className="text-2xl font-bold">Shipment not found</h2>
          <Button variant="link" onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Shipment Details</h1>
          </div>
          <div className="flex items-center gap-2">
            {shipment?.status === 'pending' ? (
              <>
                <Button 
                  variant="outline"
                  onClick={handleEditShipment}
                  disabled={editShipmentMode}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteShipment}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete
                </Button>
                <Button 
                  variant="default"
                  onClick={handleCompleteShipment}
                  disabled={details.length === 0}
                >
                  Mark as Completed
                </Button>
              </>
            ) : (
              <Button 
                variant="outline"
                onClick={handleEditShipment}
                disabled={editShipmentMode}
              >
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Shipment Information</CardTitle>
                <CardDescription>
                  View details for this shipment
                </CardDescription>
              </div>
              {!editShipmentMode && (
                <Button variant="outline" onClick={handleEditShipment}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {editShipmentMode && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleCancelEdit} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button variant="default" onClick={handleSaveShipmentChanges} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Carrier</p>
                {editShipmentMode ? (
                  <div className="mt-1">
                    <Select 
                      value={editedShipment.carrier_id || 'none'} 
                      onValueChange={(value) => handleSelectChange('carrier_id', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select carrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {carriers.map(carrier => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="font-medium">{shipment?.carrier?.name || "-"} {shipment?.subcarrier?.name ? `- ${shipment.subcarrier.name}` : ""}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subcarrier</p>
                {editShipmentMode ? (
                  <div className="mt-1">
                    <Select 
                      value={editedShipment.subcarrier_id || 'none'} 
                      onValueChange={(value) => handleSelectChange('subcarrier_id', value === 'none' ? '' : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select subcarrier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {subcarriers.map(carrier => (
                          <SelectItem key={carrier.id} value={carrier.id}>
                            {carrier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="font-medium">{shipment?.subcarrier?.name || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                {editShipmentMode ? (
                  <Input
                    name="driver_name"
                    value={editedShipment.driver_name || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{shipment?.driver_name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {editShipmentMode ? (
                  <div className="mt-1">
                    <Select 
                      value={editedShipment.status || 'pending'} 
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <p className="font-medium">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      shipment?.status === "pending" 
                        ? "bg-amber-100 text-amber-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {shipment?.status.charAt(0).toUpperCase() + shipment?.status.slice(1)}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departure Date</p>
                {editShipmentMode ? (
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {editedShipment.departure_date ? 
                            format(new Date(editedShipment.departure_date), 'PPP') : 
                            "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedShipment.departure_date ? new Date(editedShipment.departure_date) : undefined}
                          onSelect={(date) => handleDateChange('departure_date', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <p className="font-medium">{shipment ? new Date(shipment.departure_date).toLocaleDateString() : "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival Date</p>
                {editShipmentMode ? (
                  <div className="mt-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {editedShipment.arrival_date ? 
                            format(new Date(editedShipment.arrival_date), 'PPP') : 
                            "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editedShipment.arrival_date ? new Date(editedShipment.arrival_date) : undefined}
                          onSelect={(date) => handleDateChange('arrival_date', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                ) : (
                  <p className="font-medium">{shipment ? new Date(shipment.arrival_date).toLocaleDateString() : "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seal No</p>
                {editShipmentMode ? (
                  <Input
                    name="seal_no"
                    value={editedShipment.seal_no || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{shipment?.seal_no || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Truck Reg No</p>
                {editShipmentMode ? (
                  <Input
                    name="truck_reg_no"
                    value={editedShipment.truck_reg_no || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{shipment?.truck_reg_no || "-"}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trailer Reg No</p>
                {editShipmentMode ? (
                  <Input
                    name="trailer_reg_no"
                    value={editedShipment.trailer_reg_no || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{shipment?.trailer_reg_no || "-"}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Asendia A/C Net</p>
                <p className="text-2xl font-bold mt-1">{totals.asendiaNetWeight.toFixed(2)} kg</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                Manage the items in this shipment
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Documents
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleGeneratePreAlertPDF} disabled={pdfLoading}>
                    Generate Pre-Alert PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGenerateCMRPDF} disabled={pdfLoading}>
                    Generate CMR PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {!showDetailForm && shipment.status === 'pending' && (
                <Button onClick={() => setShowDetailForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Detail
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showDetailForm ? (
              <ShipmentDetailForm 
                shipmentId={id || ""} 
                onCancel={() => {
                  setShowDetailForm(false);
                  setEditingDetailId(null);
                }}
                onSave={handleSaveDetail}
                isEditMode={!!editingDetailId}
                detailId={editingDetailId}
              />
            ) : (
              details.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No details added to this shipment yet.</p>
                  {shipment.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowDetailForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Detail
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Batch selection controls */}
                  {shipment.status === 'pending' && visibleDetails.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="select-all"
                          checked={selectedDetails.size > 0 && selectedDetails.size === visibleDetails.length}
                          onCheckedChange={handleSelectAll}
                        />
                        <label htmlFor="select-all" className="text-sm cursor-pointer">
                          {selectedDetails.size > 0 && selectedDetails.size === visibleDetails.length 
                            ? "Deselect All" 
                            : "Select All"}
                        </label>
                      </div>
                      
                      {selectedDetails.size > 0 && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={handleBatchDelete}
                          disabled={selectedDetails.size === 0}
                        >
                          <Trash className="h-4 w-4 mr-2" /> 
                          Delete Selected ({selectedDetails.size})
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {visibleDetails.map(detail => (
                    <ShipmentDetailItem
                      key={detail.id}
                      detail={detail}
                      onEdit={() => handleEditDetail(detail.id)}
                      onDelete={() => handleDeleteDetail(detail.id)}
                      isExpanded={expandedDetails[detail.id]}
                      onToggleExpand={() => toggleDetailExpand(detail.id)}
                      shipmentStatus={shipment.status}
                      isSelected={selectedDetails.has(detail.id)}
                      onSelectChange={shipment.status === 'pending' ? handleSelectDetail : undefined}
                    />
                  ))}
                  
                  {hasMoreDetails && (
                    <div className="flex justify-center pt-4">
                      <Button 
                        variant="ghost"
                        onClick={toggleShowAllDetails}
                      >
                        {showAllDetails ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-2" />
                            Show fewer details
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Show all {details.length} details
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shipment detail?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this shipment detail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDetail} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeAlertOpen} onOpenChange={setCompleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the shipment as completed. You can still edit its details after completion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCompleteShipment}>
              Complete Shipment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteShipmentAlertOpen} onOpenChange={setDeleteShipmentAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete shipment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this shipment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteShipment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add new AlertDialog for batch deletion */}
      <AlertDialog open={batchDeleteAlertOpen} onOpenChange={setBatchDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete selected shipment details?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {selectedDetails.size} selected shipment details.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBatchDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ShipmentDetails;
