
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Shipment {
  id: string;
  driver_name: string;
  departure_date: string;
  arrival_date: string;
  status: string;
  seal_no: string;
  truck_reg_no: string;
  trailer_reg_no: string;
  created_at: string;
  carrier: { name: string } | null;
  subcarrier: { name: string } | null;
}

interface ShipmentTableProps {
  shipments: Shipment[];
  onSelectShipment: (shipment: Shipment) => void;
  loading: boolean;
}

const ShipmentTable = ({ shipments, onSelectShipment, loading }: ShipmentTableProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No shipments found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Departure Date</TableHead>
            <TableHead>Arrival Date</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Subcarrier</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => (
            <TableRow key={shipment.id}>
              <TableCell>
                {format(new Date(shipment.departure_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                {format(new Date(shipment.arrival_date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>{shipment.driver_name}</TableCell>
              <TableCell>{shipment.carrier?.name || "N/A"}</TableCell>
              <TableCell>{shipment.subcarrier?.name || "N/A"}</TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSelectShipment(shipment)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> 
                    Stats
                  </Button>
                  <Link to={`/shipments/${shipment.id}`}>
                    <Button variant="outline" size="sm">View Details</Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ShipmentTable;
