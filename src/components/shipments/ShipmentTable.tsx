
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
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px] sticky left-0 bg-background shadow-[4px_0_8px_rgba(0,0,0,0.1)]">Actions</TableHead>
              <TableHead className="min-w-[120px]">Departure Date</TableHead>
              <TableHead className="min-w-[120px]">Arrival Date</TableHead>
              <TableHead className="min-w-[120px]">Driver</TableHead>
              <TableHead className="min-w-[140px]">Carrier</TableHead>
              <TableHead className="min-w-[140px]">Subcarrier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shipments.map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="min-w-[180px] sticky left-0 bg-background shadow-[4px_0_8px_rgba(0,0,0,0.1)]">
                  <div className="flex gap-1 px-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onSelectShipment(shipment)}
                      className="whitespace-nowrap text-xs px-2"
                    >
                      <Eye className="h-3 w-3 mr-1" /> 
                      Stats
                    </Button>
                    <Link to={`/shipments/${shipment.id}`}>
                      <Button variant="outline" size="sm" className="whitespace-nowrap text-xs px-2">
                        Details
                      </Button>
                    </Link>
                  </div>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  {format(new Date(shipment.departure_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="min-w-[120px]">
                  {format(new Date(shipment.arrival_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell className="min-w-[120px]">{shipment.driver_name}</TableCell>
                <TableCell className="min-w-[140px]">{shipment.carrier?.name || "N/A"}</TableCell>
                <TableCell className="min-w-[140px]">{shipment.subcarrier?.name || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShipmentTable;
