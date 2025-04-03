
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

interface DropdownItem {
  id: string;
  name: string;
  service_id?: string;
}

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
        let query = supabase.from(selectedType).select('*');
        
        if (selectedType === 'formats') {
          // For formats, we need to join with services
          query = supabase.from(selectedType).select('*, service:service_id(name)');
          
          // Also fetch services for the dropdown
          const { data: servicesData, error: servicesError } = await supabase
            .from('services')
            .select('id, name')
            .order('name');
            
          if (servicesError) throw servicesError;
          setServices(servicesData || []);
        } else if (selectedType === 'customers') {
          // For customers, we need to include the is_asendia field
          query = supabase.from(selectedType).select('id, name, is_asendia');
        }
        
        // Add ordering
        query = query.order('name');
        
        const { data, error } = await query;
        
        if (error) throw error;
        setItems(data || []);
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
    
    if (selectedType === 'customers' && 'is_asendia' in item) {
      setIsAsendiaCustomer(item.is_asendia as boolean);
    }
    
    if (selectedType === 'formats' && item.service_id) {
      setServiceId(item.service_id);
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
      if (formMode === 'create') {
        // Create new item
        let newData: any = { name: itemName };
        
        if (selectedType === 'customers') {
          newData.is_asendia = isAsendiaCustomer;
        }
        
        if (selectedType === 'formats') {
          newData.service_id = serviceId;
        }
        
        const { data, error } = await supabase
          .from(selectedType)
          .insert([newData])
          .select();
          
        if (error) throw error;
        
        // Update local state
        if (data) {
          setItems([...items, data[0]]);
        }
        
        toast({
          title: "Success",
          description: `${selectedType.slice(0, -1)} added successfully.`,
        });
      } else if (formMode === 'edit' && editingItemId) {
        // Update existing item
        let updateData: any = { name: itemName };
        
        if (selectedType === 'customers') {
          updateData.is_asendia = isAsendiaCustomer;
        }
        
        if (selectedType === 'formats') {
          updateData.service_id = serviceId;
        }
        
        const { error } = await supabase
          .from(selectedType)
          .update(updateData)
          .eq('id', editingItemId);
          
        if (error) throw error;
        
        // Update local state
        const updatedItems = items.map(item => {
          if (item.id === editingItemId) {
            return { ...item, name: itemName, ...(selectedType === 'customers' ? { is_asendia: isAsendiaCustomer } : {}), ...(selectedType === 'formats' ? { service_id: serviceId } : {}) };
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
                          {(item as any).is_asendia ? "Yes" : "No"}
                        </TableCell>
                      )}
                      {selectedType === 'formats' && (
                        <TableCell>
                          {(item as any).service?.name || "-"}
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
