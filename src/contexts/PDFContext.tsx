
import React, { createContext, useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generatePreAlertPDF, generateCMRPDF, downloadPDF, PdfGenerationOptions } from "@/utils/pdfGenerator";
import { isNativeMobile } from "@/utils/mobileHelper";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Default logo - base64 encoded small placeholder logo
const DEFAULT_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqNX6+AAAACXBIWXMAAAsTAAALEwEAmpwYAAAF7mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wMS0yNlQxMDowNjo1MSswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDEtMjZUMTA6MTQ6MDcrMDE6MDAiIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDEtMjZUMTA6MTQ6MDcrMDE6MDAiIGRjOmZvcm1hdD0iaW1hZ2UvcG5nIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YzI0OTk2NGUtMzg0Yi01ZTQ3LTg2YTEtOTVjYjEzOTZjODMzIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOmZlMzM3MjEwLTk3Y2MtNGE0ZC1hZTMyLTUzYWZjZTU4ZGUzNSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOmZlMzM3MjEwLTk3Y2MtNGE0ZC1hZTMyLTUzYWZjZTU4ZGUzNSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZmUzMzcyMTAtOTdjYy00YTRkLWFlMzItNTNhZmNlNThkZTM1IiBzdEV2dDp3aGVuPSIyMDIzLTAxLTI2VDEwOjA2OjUxKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjMjQ5OTY0ZS0zODRiLTVlNDctODZhMS05NWNiMTM5NmM4MzMiIHN0RXZ0OndoZW49IjIwMjMtMDEtMjZUMTA6MTQ6MDcrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+3OJJfwAABzlJREFUeJztnE9sFVUUxn9UhdYWsRSpVNCiBsQYo24kIkaJxpj4B2swGhcudOdCY4wLdxoXxrjRhQldqFGMGmOMujDRpWIQWk2QWEEqIlAIYoFC5d9i8c3LnJl77713ptN5j3mTSdN5M3PmzHfPnHvu+c5tWLdund1LLAEagTpgHbAKaAZWAsuApcCfiA++R5L5FhOTbQJGgH3ANuBr4CxpUiPe9TpgDfAusAVYizh+NO8CuQxJRguRYfeDwBbgd2AImCTNUgtMAD8CZyPXvAI8BDSSGlKerM1AFzAMfIFMUwuO0IFs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";

type PDFContextType = {
  generatePreAlertPDF: (shipmentId: string, options?: PdfGenerationOptions) => Promise<void>;
  generateCMRPDF: (shipmentId: string, options?: PdfGenerationOptions) => Promise<void>;
  loading: boolean;
};

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const nativeMobile = isNativeMobile();

  const handlePreAlertPDF = async (shipmentId: string, options?: PdfGenerationOptions) => {
    try {
      setLoading(true);
      
      // Fetch shipment data for filename generation
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('seal_no, departure_date')
        .eq('id', shipmentId)
        .single();
        
      if (error) throw error;
      
      // Add default logo if not provided
      const pdfOptions = {
        ...options,
        logoImgData: options?.logoImgData || DEFAULT_LOGO,
      };
      
      const pdfDataUri = await generatePreAlertPDF(shipmentId, pdfOptions);
      
      // Generate filename using the pattern: Pre-Alert, [Seal No], [Date in dd-MM-yy], [Current Time in HH:mm:ss]
      const sealNo = shipment.seal_no || 'NoSeal';
      const departureDate = format(new Date(shipment.departure_date), 'dd-MM-yy');
      const currentTime = format(new Date(), 'HH:mm:ss');
      const fileName = `Pre-Alert, ${sealNo}, ${departureDate} ${currentTime}.pdf`;
      
      await downloadPDF(pdfDataUri, fileName, nativeMobile);
      
      toast({
        title: "PDF Generated",
        description: nativeMobile 
          ? "Pre-Alert PDF has been generated and saved to device" 
          : "Pre-Alert PDF has been generated and downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating Pre-Alert PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate Pre-Alert PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCMRPDF = async (shipmentId: string, options?: PdfGenerationOptions) => {
    try {
      setLoading(true);
      
      // Fetch shipment data for filename generation
      const { data: shipment, error } = await supabase
        .from('shipments')
        .select('seal_no, departure_date')
        .eq('id', shipmentId)
        .single();
        
      if (error) throw error;
      
      // Add default logo if not provided
      const pdfOptions = {
        ...options,
        logoImgData: options?.logoImgData || DEFAULT_LOGO,
      };
      
      const pdfDataUri = await generateCMRPDF(shipmentId, pdfOptions);
      
      // Generate filename using the pattern: CMR, [Seal No], [Date in dd-MM-yy], [Current Time in HH:mm:ss]
      const sealNo = shipment.seal_no || 'NoSeal';
      const departureDate = format(new Date(shipment.departure_date), 'dd-MM-yy');
      const currentTime = format(new Date(), 'HH:mm:ss');
      const fileName = `CMR, ${sealNo}, ${departureDate} ${currentTime}.pdf`;
      
      await downloadPDF(pdfDataUri, fileName, nativeMobile);
      
      toast({
        title: "PDF Generated",
        description: nativeMobile
          ? "CMR PDF has been generated and saved to device"
          : "CMR PDF has been generated and downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating CMR PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate CMR PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PDFContext.Provider value={{
      generatePreAlertPDF: handlePreAlertPDF,
      generateCMRPDF: handleCMRPDF,
      loading
    }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error("usePDF must be used within a PDFProvider");
  }
  return context;
};
