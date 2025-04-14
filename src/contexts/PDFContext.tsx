
import React, { createContext, useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generatePreAlertPDF, generateCMRPDF, downloadPDF, PdfGenerationOptions } from "@/utils/pdfGenerator";
import { isNativeMobile } from "@/utils/mobileHelper";
import { format } from "date-fns";

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
      
      const pdfDataUri = await generatePreAlertPDF(shipmentId, options);
      
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
      
      const pdfDataUri = await generateCMRPDF(shipmentId, options);
      
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

// Import supabase at the top to fix reference error
import { supabase } from "@/integrations/supabase/client";
