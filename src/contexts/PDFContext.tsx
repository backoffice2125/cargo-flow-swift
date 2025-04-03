
import React, { createContext, useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generatePreAlertPDF, generateCMRPDF, downloadPDF } from "@/utils/pdfGenerator";

type PDFContextType = {
  generatePreAlertPDF: (shipmentId: string) => Promise<void>;
  generateCMRPDF: (shipmentId: string) => Promise<void>;
  loading: boolean;
};

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePreAlertPDF = async (shipmentId: string) => {
    try {
      setLoading(true);
      
      const pdfDataUri = await generatePreAlertPDF(shipmentId);
      downloadPDF(pdfDataUri, `pre-alert-${shipmentId.substring(0, 8)}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Pre-Alert PDF has been generated and downloaded successfully",
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

  const handleCMRPDF = async (shipmentId: string) => {
    try {
      setLoading(true);
      
      const pdfDataUri = await generateCMRPDF(shipmentId);
      downloadPDF(pdfDataUri, `cmr-${shipmentId.substring(0, 8)}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "CMR PDF has been generated and downloaded successfully",
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
