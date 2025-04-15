
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const WelcomeWidget = () => {
  const { user } = useAuth();
  const username = user?.email?.split('@')[0] || 'Guest';
  
  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Welcome, {username}!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Here's your shipment management dashboard with real-time updates.
        </p>
      </CardContent>
    </Card>
  );
};

export default WelcomeWidget;
