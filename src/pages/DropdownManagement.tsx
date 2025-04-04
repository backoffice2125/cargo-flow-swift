
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Plus, Save, Trash, Edit, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";

// Define more specific types for each dropdown item type
interface BaseDropdownItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CarrierItem extends BaseDropdownItem {}
interface SubcarrierItem extends BaseDropdownItem {}
interface ServiceItem extends BaseDropdownItem {}

interface CustomerItem extends BaseDropdownItem {
  is_asendia: boolean;
}

interface FormatItem extends BaseDropdownItem {
  service_id: string | null;
  service?: {
    name: string;
  };
}

interface DoeItem extends BaseDropdownItem {}
interface PriorFormatItem extends BaseDropdownItem {}
interface EcoFormatItem extends BaseDropdownItem {}
interface S3cFormatItem extends BaseDropdownItem {}

// Union type for all possible item types
type DropdownItem = 
  | CarrierItem 
  | SubcarrierItem 
  | CustomerItem 
  | ServiceItem 
  | FormatItem 
  | DoeItem 
  | PriorFormatItem 
  | EcoFormatItem 
  | S3cFormatItem;

// Define types for new item data based on dropdown type
type CarrierInsert = { name: string };
type SubcarrierInsert = { name: string };
type ServiceInsert = { name: string };
type CustomerInsert = { name: string; is_asendia: boolean };
type FormatInsert = { name: string; service_id: string };
type DoeInsert = { name: string };
type PriorFormatInsert = { name: string };
type EcoFormatInsert = { name: string };
type S3cFormatInsert = { name: string };

interface Service {
  id: string;
  name: string;
}

type DropdownType = 'carriers' | 'subcarriers' | 'customers' | 'services' | 'formats' | 'prior_formats' | 'eco_formats' | 's3c_formats' | 'doe';

const DropdownManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [selectedType, setSelectedType] = useState<DropdownType>('carriers');
  const [items, setItems] = useState<DropdownItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [itemName, setItemName] = useState('');
  const [isAsendiaCustomer, setIsAsendiaCustomer] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  // For format dropdown management
  const [services, setServices] = useState<Service[]>([]);
  
  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setIsAdmin(data?.role === 'admin');
        
        // If not admin, redirect to home
        if (data?.role !== 'admin') {
          toast({
            title: "Access denied",
            description: "You don't have permission to access this page",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };
    
    checkAdmin();
  }, [user, navigate, toast]);
  
  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        // Handle each dropdown type separately to ensure proper typing
        switch (selectedType) {
          case 'formats': {
            const { data, error } = await supabase
              .from('formats')
              .select('*, service:service_id(name)')
              .order('name');
            
            if (error) throw error;
            setItems(data || []);
            
            // Fetch services for the dropdown
            const { data: servicesData, error: servicesError } = await supabase
              .from('services')
              .select('id, name')
              .order('name');
              
            if (servicesError) throw servicesError;
            setServices(servicesData || []);
            break;
          }
          case 'customers': {
            const { data, error } = await supabase
              .from('customers')
              .select('id, name, is_asendia, created_at, updated_at')
              .order('name');
            
            if (error) throw error;
            setItems(data || []);
            break;
          }
          default: {
            // For other tables, they all have the same structure
            const { data, error } = await supabase
              .from(selectedType)
              .select('*')
              .order('name');
            
            if (error) throw error;
            setItems(data || []);
            break;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${selectedType}:`, error);
        toast({
          title: "Error",
          description: `Failed to load ${selectedType} data.`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedType, isAdmin, toast]);
  
  const resetForm = () => {
    setItemName('');
    setIsAsendiaCustomer(false);
    setServiceId('');
    setEditingItemId(null);
  };
  
  const handleAdd = () => {
    setFormMode('create');
    resetForm();
    setShowForm(true);
  };
  
  const handleEdit = (item: DropdownItem) => {
    setFormMode('edit');
    setItemName(item.name);
    setEditingItemId(item.id);
    
    if ('is_asendia' in item) {
      setIsAsendiaCustomer(item.is_asendia);
    }
    
    if ('service_id' in item) {
      setServiceId(item.service_id || '');
    }
    
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from(selectedType)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setItems(items.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: `${selectedType.slice(0, -1)} deleted successfully.`,
      });
    } catch (error) {
      console.error(`Error deleting ${selectedType}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete the ${selectedType.slice(0, -1)}.`,
        variant: "destructive",
      });
    }
  };
  
  const handleSubmit = async () => {
    if (!itemName.trim()) {
      toast({
        title: "Missing field",
        description: "Name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedType === 'formats' && !serviceId) {
      toast({
        title: "Missing field",
        description: "Service is required for formats.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Prepare data based on the selected type with proper typing
      let newData: 
        | CarrierInsert
        | SubcarrierInsert
        | CustomerInsert
        | ServiceInsert
        | FormatInsert
        | DoeInsert
        | PriorFormatInsert
        | EcoFormatInsert
        | S3cFormatInsert;
      
      // Set the base data (name is common to all types)
      newData = { name: itemName } as any;
      
      // Add type-specific fields
      if (selectedType === 'customers') {
        (newData as CustomerInsert).is_asendia = isAsendiaCustomer;
      }
      
      if (selectedType === 'formats') {
        (newData as FormatInsert).service_id = serviceId;
      }
      
      if (formMode === 'create') {
        // Type-safe insert based on the selected dropdown type
        let response;
        
        switch (selectedType) {
          case 'carriers':
            response = await supabase
              .from('carriers')
              .insert(newData as CarrierInsert)
              .select();
            break;
          case 'subcarriers':
            response = await supabase
              .from('subcarriers')
              .insert(newData as SubcarrierInsert)
              .select();
            break;
          case 'customers':
            response = await supabase
              .from('customers')
              .insert(newData as CustomerInsert)
              .select();
            break;
          case 'services':
            response = await supabase
              .from('services')
              .insert(newData as ServiceInsert)
              .select();
            break;
          case 'formats':
            response = await supabase
              .from('formats')
              .insert(newData as FormatInsert)
              .select();
            break;
          case 'prior_formats':
            response = await supabase
              .from('prior_formats')
              .insert(newData as PriorFormatInsert)
              .select();
            break;
          case 'eco_formats':
            response = await supabase
              .from('eco_formats')
              .insert(newData as EcoFormatInsert)
              .select();
            break;
          case 's3c_formats':
            response = await supabase
              .from('s3c_formats')
              .insert(newData as S3cFormatInsert)
              .select();
            break;
          case 'doe':
            response = await supabase
              .from('doe')
              .insert(newData as DoeInsert)
              .select();
            break;
          default:
            throw new Error(`Unsupported dropdown type: ${selectedType}`);
        }
        
        const { data, error } = response;
        
        if (error) throw error;
        
        // Update local state
        if (data) {
          setItems([...items, data[0] as DropdownItem]);
        }
        
        toast({
          title: "Success",
          description: `${selectedType.slice(0, -1)} added successfully.`,
        });
      } else if (formMode === 'edit' && editingItemId) {
        // Type-safe update based on the selected dropdown type
        let response;
        
        switch (selectedType) {
          case 'carriers':
            response = await supabase
              .from('carriers')
              .update(newData as CarrierInsert)
              .eq('id', editingItemId);
            break;
          case 'subcarriers':
            response = await supabase
              .from('subcarriers')
              .update(newData as SubcarrierInsert)
              .eq('id', editingItemId);
            break;
          case 'customers':
            response = await supabase
              .from('customers')
              .update(newData as CustomerInsert)
              .eq('id', editingItemId);
            break;
          case 'services':
            response = await supabase
              .from('services')
              .update(newData as ServiceInsert)
              .eq('id', editingItemId);
            break;
          case 'formats':
            response = await supabase
              .from('formats')
              .update(newData as FormatInsert)
              .eq('id', editingItemId);
            break;
          case 'prior_formats':
            response = await supabase
              .from('prior_formats')
              .update(newData as PriorFormatInsert)
              .eq('id', editingItemId);
            break;
          case 'eco_formats':
            response = await supabase
              .from('eco_formats')
              .update(newData as EcoFormatInsert)
              .eq('id', editingItemId);
            break;
          case 's3c_formats':
            response = await supabase
              .from('s3c_formats')
              .update(newData as S3cFormatInsert)
              .eq('id', editingItemId);
            break;
          case 'doe':
            response = await supabase
              .from('doe')
              .update(newData as DoeInsert)
              .eq('id', editingItemId);
            break;
          default:
            throw new Error(`Unsupported dropdown type: ${selectedType}`);
        }
        
        const { error } = response;
        
        if (error) throw error;
        
        // Update local state
        const updatedItems = items.map(item => {
          if (item.id === editingItemId) {
            // Create a new updated item preserving the type
            const updatedItem = { 
              ...item, 
              name: itemName,
              updated_at: new Date().toISOString() 
            };
            
            // Update specific fields based on dropdown type
            if (selectedType === 'customers' && 'is_asendia' in updatedItem) {
              updatedItem.is_asendia = isAsendiaCustomer;
            }
            
            if (selectedType === 'formats' && 'service_id' in updatedItem) {
              updatedItem.service_id = serviceId;
              // Update the service name in the UI if available
              if (serviceId) {
                const serviceName = services.find(s => s.id === serviceId)?.name;
                if (serviceName && updatedItem.service) {
                  updatedItem.service.name = serviceName;
                } else {
                  updatedItem.service = { name: serviceName || '' };
                }
              } else {
                updatedItem.service = undefined;
              }
            }
            
            return updatedItem;
          }
          return item;
        });
        
        setItems(updatedItems);
        
        toast({
          title: "Success",
          description: `${selectedType.slice(0, -1)} updated successfully.`,
        });
      }
      
      // Reset form and close dialog
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error(`Error ${formMode === 'create' ? 'adding' : 'updating'} ${selectedType}:`, error);
      toast({
        title: "Error",
        description: `Failed to ${formMode === 'create' ? 'add' : 'update'} the ${selectedType.slice(0, -1)}.`,
        variant: "destructive",
      });
    }
  };
  
  // Return early if not admin
  if (!isAdmin) {
    return null;
  }
  
  // Helper function to safely check properties
  const isCustomer = (item: DropdownItem): item is CustomerItem => 
    'is_asendia' in item;
    
  const isFormat = (item: DropdownItem): item is FormatItem => 
    'service_id' in item;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Dropdown Management</h1>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={selectedType === 'carriers' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('carriers')}
          >
            Carriers
          </Button>
          <Button 
            variant={selectedType === 'subcarriers' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('subcarriers')}
          >
            Subcarriers
          </Button>
          <Button 
            variant={selectedType === 'customers' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('customers')}
          >
            Customers
          </Button>
          <Button 
            variant={selectedType === 'services' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('services')}
          >
            Services
          </Button>
          <Button 
            variant={selectedType === 'formats' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('formats')}
          >
            Standard Formats
          </Button>
          <Button 
            variant={selectedType === 'prior_formats' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('prior_formats')}
          >
            Prior Formats
          </Button>
          <Button 
            variant={selectedType === 'eco_formats' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('eco_formats')}
          >
            Eco Formats
          </Button>
          <Button 
            variant={selectedType === 's3c_formats' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('s3c_formats')}
          >
            S3C Formats
          </Button>
          <Button 
            variant={selectedType === 'doe' ? 'default' : 'outline'} 
            onClick={() => setSelectedType('doe')}
          >
            DOE
          </Button>
        </div>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}</CardTitle>
              <CardDescription>
                Manage {selectedType} dropdown options
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : items.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {selectedType === 'customers' && <TableHead>Is Asendia</TableHead>}
                    {selectedType === 'formats' && <TableHead>Service</TableHead>}
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      {selectedType === 'customers' && (
                        <TableCell>
                          {isCustomer(item) ? (item.is_asendia ? "Yes" : "No") : "N/A"}
                        </TableCell>
                      )}
                      {selectedType === 'formats' && (
                        <TableCell>
                          {isFormat(item) && item.service ? item.service.name : "-"}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No items found. Click "Add New" to create one.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          resetForm();
        }
        setShowForm(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'create' ? 'Add New' : 'Edit'} {selectedType.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              {formMode === 'create' ? 'Enter details to create a new' : 'Update the'} {selectedType.slice(0, -1)}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)}
                placeholder={`Enter ${selectedType.slice(0, -1)} name`}
              />
            </div>
            
            {selectedType === 'customers' && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAsendia"
                  checked={isAsendiaCustomer}
                  onChange={(e) => setIsAsendiaCustomer(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isAsendia">Is Asendia Customer</Label>
              </div>
            )}
            
            {selectedType === 'formats' && (
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select 
                  value={serviceId}
                  onValueChange={(value) => setServiceId(value)}
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {formMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default DropdownManagement;
