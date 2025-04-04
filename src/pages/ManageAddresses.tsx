import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { supabase, AddressSettings, getAddressSettingsTable } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define the schema for address validation
const addressSchema = z.object({
  sender_name: z.string().min(2, { message: "Sender name is required" }),
  sender_address: z.string().min(2, { message: "Sender address is required" }),
  sender_city: z.string().min(2, { message: "Sender city is required" }),
  sender_country: z.string().min(2, { message: "Sender country is required" }),
  sender_postal_code: z.string().min(1, { message: "Sender postal code is required" }),
  receiver_name: z.string().min(2, { message: "Receiver name is required" }),
  receiver_address: z.string().min(2, { message: "Receiver address is required" }),
  receiver_city: z.string().min(2, { message: "Receiver city is required" }),
  receiver_country: z.string().min(2, { message: "Receiver country is required" }),
  receiver_postal_code: z.string().min(1, { message: "Receiver postal code is required" }),
});

type AddressData = z.infer<typeof addressSchema>;

const ManageAddresses = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
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
    },
  });

  // Fetch existing address settings from Supabase
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const { data, error } = await getAddressSettingsTable()
          .select('*')
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const addresses = data[0] as AddressSettings;
          form.reset({
            sender_name: addresses.sender_name || "",
            sender_address: addresses.sender_address || "",
            sender_city: addresses.sender_city || "",
            sender_country: addresses.sender_country || "",
            sender_postal_code: addresses.sender_postal_code || "",
            receiver_name: addresses.receiver_name || "",
            receiver_address: addresses.receiver_address || "",
            receiver_city: addresses.receiver_city || "",
            receiver_country: addresses.receiver_country || "",
            receiver_postal_code: addresses.receiver_postal_code || "",
          });
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
        toast({
          title: "Error",
          description: "Failed to load address settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddresses();
  }, [user, toast, form]);

  // Handle form submission
  const onSubmit = async (data: AddressData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to save address settings",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const { data: existingData, error: fetchError } = await getAddressSettingsTable()
        .select('id')
        .limit(1);
        
      if (fetchError) throw fetchError;
      
      let result;
      
      if (existingData && existingData.length > 0) {
        // Update existing record
        result = await getAddressSettingsTable()
          .update(data)
          .eq('id', existingData[0].id);
      } else {
        // Insert new record - Ensure all required fields are present
        const addressData: AddressSettings = {
          sender_name: data.sender_name,
          sender_address: data.sender_address,
          sender_city: data.sender_city,
          sender_country: data.sender_country,
          sender_postal_code: data.sender_postal_code,
          receiver_name: data.receiver_name,
          receiver_address: data.receiver_address,
          receiver_city: data.receiver_city,
          receiver_country: data.receiver_country,
          receiver_postal_code: data.receiver_postal_code,
        };
        
        result = await getAddressSettingsTable().insert(addressData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: "Address settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving addresses:', error);
      toast({
        title: "Error",
        description: "Failed to save address settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Manage Addresses</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Sender & Receiver Addresses</CardTitle>
            <CardDescription>
              These addresses will be used in the CMR and Pre-Alert documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sender Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sender Information</h3>
                    
                    <FormField
                      control={form.control}
                      name="sender_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Sender name" {...field} />
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
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sender_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
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
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="sender_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
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
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Receiver name" {...field} />
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
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="receiver_city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="City" {...field} />
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
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="receiver_country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Addresses
                      </>
                    )}
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

export default ManageAddresses;
