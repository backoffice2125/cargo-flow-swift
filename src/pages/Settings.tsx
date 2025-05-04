
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon, User, Bell, Shield } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Settings = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your account details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.first_name || user?.email}`} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium">{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">Role: {profile?.role || 'user'}</p>
                    <div className="pt-2">
                      <Button size="sm" variant="outline">Change Avatar</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <h3 className="text-lg font-medium">Personal Information</h3>
                    <p className="text-sm text-muted-foreground">Update your personal details</p>
                  </div>
                  
                  <div className="grid gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <input 
                          id="firstName"
                          type="text"
                          className="w-full p-2 border rounded-md"
                          placeholder="First Name"
                          defaultValue={profile?.first_name || ''}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <input 
                          id="lastName"
                          type="text"
                          className="w-full p-2 border rounded-md"
                          placeholder="Last Name"
                          defaultValue={profile?.last_name || ''}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input 
                        id="email"
                        type="email"
                        className="w-full p-2 border rounded-md bg-muted"
                        placeholder="Email"
                        defaultValue={user?.email || ''}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Contact admin to change your email</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Email Notifications</h3>
                      <p className="text-sm text-muted-foreground">Receive email updates about shipment status changes</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">In-App Notifications</h3>
                      <p className="text-sm text-muted-foreground">Show notifications within the application</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium">Daily Summary</h3>
                      <p className="text-sm text-muted-foreground">Receive a daily summary of all activity</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                        <input 
                          id="currentPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                        <input 
                          id="newPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                        <input 
                          id="confirmPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="••••••••"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>Update Password</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
