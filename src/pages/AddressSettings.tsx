
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { supabase, AddressSettings } from "@/integrations/supabase/client";

const AddressSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [addressId, setAddressId] = useState<string | null>(null);
  
  const form = useForm<AddressSettings>({
    defaultValues: {
      sender_name: "",
      sender_address: "",
      sender_city: "",
      sender_country: "",
      sender_postal_code: "",
      receiver_name: "",
      receiver_address: "",
      receiver_city: "",
      receiver_country: "",
      receiver_postal_code: "",
    }
  });

  // Fetch existing address settings
  useEffect(() => {
    const fetchAddressSettings = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('address_settings').select('*').limit(1).single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
        
        if (data) {
          setAddressId(data.id);
          form.reset(data);
        }
      } catch (error) {
        console.error('Error fetching address settings:', error);
        toast({
          title: "Error",
          description: "Failed to load address settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAddressSettings();
  }, [form, toast]);

  const onSubmit = async (data: AddressSettings) => {
    try {
      setIsLoading(true);
      
      const addressData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      let response;
      
      if (addressId) {
        // Update existing record
        response = await supabase
          .from('address_settings')
          .update(addressData)
          .eq('id', addressId);
      } else {
        // Create new record
        response = await supabase
          .from('address_settings')
          .insert([addressData]);
      }
      
      if (response.error) throw response.error;
      
      toast({
        title: "Success",
        description: "Address settings saved successfully.",
      });
      
      // If it was a new record, fetch the new ID
      if (!addressId) {
        const { data, error } = await supabase.from('address_settings').select('id').limit(1).single();
        if (!error && data) {
          setAddressId(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving address settings:', error);
      toast({
        title: "Error",
        description: "Failed to save address settings. Please try again.",
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
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Address Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sender & Receiver Information</CardTitle>
            <CardDescription>
              These addresses will be used for generating CMR documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sender Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="sender_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Sender's name" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sender_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address*</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sender_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sender_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country*</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="sender_postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Receiver Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Receiver Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="receiver_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name*</FormLabel>
                          <FormControl>
                            <Input placeholder="Receiver's name" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="receiver_address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address*</FormLabel>
                          <FormControl>
                            <Input placeholder="Street address" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="receiver_city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City*</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="receiver_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country*</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="receiver_postal_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code*</FormLabel>
                          <FormControl>
                            <Input placeholder="Postal code" {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AddressSettingsPage;
