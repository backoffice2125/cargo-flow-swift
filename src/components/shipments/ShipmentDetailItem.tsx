
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash, ChevronDown, ChevronUp } from "lucide-react";

interface ShipmentDetailItemProps {
  detail: {
    id: string;
    number_of_pallets: number;
    number_of_bags: number;
    customer?: {
      name: string;
      is_asendia?: boolean;
    } | null;
    service?: {
      name: string;
    } | null;
    format?: {
      name: string;
    } | null;
    prior_format?: {
      name: string;
    } | null;
    eco_format?: {
      name: string;
    } | null;
    s3c_format?: {
      name: string;
    } | null;
    gross_weight: number;
    tare_weight: number;
    net_weight: number;
    dispatch_number: string | null;
    doe?: {
      name: string;
    } | null;
  };
  onEdit?: (detailId: string) => void;
  onDelete?: (detailId: string) => void;
  showActions?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  shipmentStatus?: string;
}

const ShipmentDetailItem: React.FC<ShipmentDetailItemProps> = ({ 
  detail, 
  onEdit, 
  onDelete, 
  showActions = false,
  isExpanded = true,
  onToggleExpand,
  shipmentStatus
}) => {
  return (
    <div className="bg-background border rounded-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-8 w-8" 
            onClick={onToggleExpand}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <span className="ml-2 font-medium">
            {detail.customer?.name || 'Unknown Customer'} {detail.service?.name ? `- ${detail.service.name}` : ''}
          </span>
        </div>
        
        {(showActions || (shipmentStatus === 'pending' && onEdit && onDelete)) && (
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit(detail.id);
              }}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10" 
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) onDelete(detail.id);
              }}
            >
              <Trash className="h-4 w-4 mr-2" /> Delete
            </Button>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-2">
          <div>
            <p className="text-xs text-muted-foreground">Pallets</p>
            <p>{detail.number_of_pallets}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bags</p>
            <p>{detail.number_of_bags}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Format</p>
            <p>
              {
                detail.service?.name === 'Prior' ? detail.prior_format?.name :
                detail.service?.name === 'Eco' ? detail.eco_format?.name :
                detail.service?.name === 'S3C' ? detail.s3c_format?.name :
                detail.format?.name || '-'
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gross Weight</p>
            <p>{detail.gross_weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tare Weight</p>
            <p>{detail.tare_weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Weight</p>
            <p>{detail.net_weight.toFixed(2)} kg</p>
          </div>
          {detail.dispatch_number && (
            <div>
              <p className="text-xs text-muted-foreground">Dispatch Number</p>
              <p>{detail.dispatch_number}</p>
            </div>
          )}
          {detail.doe && (
            <div>
              <p className="text-xs text-muted-foreground">DOE</p>
              <p>{detail.doe.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShipmentDetailItem;
