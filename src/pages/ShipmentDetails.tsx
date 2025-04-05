import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Plus, Trash, Edit, FilePlus, Loader2, Pencil, ChevronRight, ChevronDown } from "lucide-react";
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
  } | null;
  subcarrier: {
    name: string;
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

  useEffect(() => {
    const fetchShipmentData = async () => {
      if (!id) return;

      setIsLoading(true);
      
      try {
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select(`
            *,
            carrier:carrier_id(name),
            subcarrier:subcarrier_id(name)
          `)
          .eq('id', id)
          .single();
        
        if (shipmentError) throw shipmentError;
        setShipment(shipmentData);
        setEditedShipment({
          driver_name: shipmentData.driver_name,
          seal_no: shipmentData.seal_no,
          truck_reg_no: shipmentData.truck_reg_no,
          trailer_reg_no: shipmentData.trailer_reg_no,
        });
        
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
      
      setDetails(prev => prev.filter(detail => detail.id !== deleteDetailId));
      calculateTotals(details.filter(detail => detail.id !== deleteDetailId));
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
    setEditShipmentMode(true);
  };

  const handleSaveShipmentChanges = async () => {
    if (!id || !shipment) return;
    
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          driver_name: editedShipment.driver_name,
          seal_no: editedShipment.seal_no,
          truck_reg_no: editedShipment.truck_reg_no,
          trailer_reg_no: editedShipment.trailer_reg_no,
        })
        .eq('id', id);
        
      if (error) throw error;
      
      await supabase
        .from('audit_logs')
        .insert([{
          user_id: user?.id,
          shipment_id: id,
          action: 'edit_shipment',
          old_data: {
            driver_name: shipment.driver_name,
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

  const toggleDetailExpand = (detailId: string) => {
    setExpandedDetails(prev => ({
      ...prev,
      [detailId]: !prev[detailId]
    }));
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
            {shipment.status === 'pending' && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleEditShipment}
                  disabled={editShipmentMode}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteShipment}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="default"
                  onClick={handleCompleteShipment}
                  disabled={details.length === 0}
                >
                  Mark as Completed
                </Button>
              </>
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
              {editShipmentMode && (
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setEditShipmentMode(false)}>
                    Cancel
                  </Button>
                  <Button variant="default" onClick={handleSaveShipmentChanges}>
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Carrier</p>
                <p className="font-medium">{shipment.carrier?.name || "-"} {shipment.subcarrier?.name ? `- ${shipment.subcarrier.name}` : ""}</p>
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
                  <p className="font-medium">{shipment.driver_name}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departure Date</p>
                <p className="font-medium">{new Date(shipment.departure_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Arrival Date</p>
                <p className="font-medium">{new Date(shipment.arrival_date).toLocaleDateString()}</p>
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
                  <p className="font-medium">{shipment.seal_no || "-"}</p>
                )}
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
                {editShipmentMode ? (
                  <Input
                    name="truck_reg_no"
                    value={editedShipment.truck_reg_no || ''}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{shipment.truck_reg_no || "-"}</p>
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
                  <p className="font-medium">{shipment.trailer_reg_no || "-"}</p>
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
                <p className="text-sm text-muted-foreground">Asendia Net</p>
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
                Manage items in this shipment
              </CardDescription>
            </div>
            {shipment.status === 'pending' && (
              <Button 
                onClick={() => {
                  setEditingDetailId(null);
                  setShowDetailForm(true);
                }} 
                disabled={showDetailForm}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Detail
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {showDetailForm ? (
              <ShipmentDetailForm 
                shipmentId={id!}
                onCancel={() => {
                  setShowDetailForm(false);
                  setEditingDetailId(null);
                }} 
                onSave={handleSaveDetail}
                isEditMode={!!editingDetailId}
                detailId={editingDetailId}
              />
            ) : details.length > 0 ? (
              <div className="space-y-4">
                {details.map((detail) => (
                  <div key={detail.id} className="border rounded-md bg-card overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted/30"
                      onClick={() => toggleDetailExpand(detail.id)}
                    >
                      <div className="flex items-center">
                        {expandedDetails[detail.id] ? 
                          <ChevronDown className="h-4 w-4 mr-2" /> : 
                          <ChevronRight className="h-4 w-4 mr-2" />
                        }
                        <h3 className="font-medium">
                          {detail.customer?.name || "Customer"} - {detail.service?.name || "Service"}
                        </h3>
                      </div>
                      {shipment.status === 'pending' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditDetail(detail.id);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDetail(detail.id);
                              }}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    
                    {expandedDetails[detail.id] && (
                      <div className="p-4 pt-0 border-t">
                        <ShipmentDetailItem detail={detail} />
                      </div>
                    )}
                  </div>
                ))}

                {shipment.status === 'completed' && (
                  <div className="mt-6">
                    <Card className="bg-muted/30">
                      <CardHeader>
                        <CardTitle className="text-lg">Document Generation</CardTitle>
                        <CardDescription>
                          Generate documents for this completed shipment
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Button 
                            variant="outline" 
                            className="h-24 flex flex-col items-center justify-center"
                            onClick={handleGeneratePreAlertPDF}
                            disabled={pdfLoading}
                          >
                            {pdfLoading ? (
                              <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            ) : (
                              <FilePlus className="h-6 w-6 mb-2" />
                            )}
                            <span>Generate Pre-Alert PDF</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-24 flex flex-col items-center justify-center"
                            onClick={handleGenerateCMRPDF}
                            disabled={pdfLoading}
                          >
                            {pdfLoading ? (
                              <Loader2 className="h-6 w-6 mb-2 animate-spin" />
                            ) : (
                              <FilePlus className="h-6 w-6 mb-2" />
                            )}
                            <span>Generate CMR PDF</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">No details added to this shipment yet</p>
                {shipment.status === 'pending' && (
                  <Button onClick={() => setShowDetailForm(true)} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Detail
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shipment Detail</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shipment detail? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDetail} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={completeAlertOpen} onOpenChange={setCompleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Shipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this shipment as completed? This will lock the shipment for further editing.
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
            <AlertDialogTitle>Delete Shipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shipment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteShipment} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default ShipmentDetails;
