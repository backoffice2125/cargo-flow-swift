
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { saveFile } from "@/utils/mobileHelper";
import { format } from "date-fns";

// Add type declaration for jspdf-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types for our shipment data
interface Shipment {
  id: string;
  driver_name: string;
  departure_date: string;
  arrival_date: string;
  status: string;
  seal_no: string | null;
  truck_reg_no: string | null;
  trailer_reg_no: string | null;
  created_at: string;
  carrier: { name: string } | null;
  subcarrier: { name: string } | null;
}

interface ShipmentDetail {
  id: string;
  shipment_id: string;
  number_of_pallets: number;
  number_of_bags: number;
  gross_weight: number;
  tare_weight: number;
  net_weight: number;
  dispatch_number: string | null;
  customer: { name: string; is_asendia: boolean } | null;
  service: { name: string } | null;
  format: { name: string } | null;
  prior_format: { name: string } | null;
  eco_format: { name: string } | null;
  s3c_format: { name: string } | null;
  doe: { name: string } | null;
  created_at: string;
}

interface AddressSettings {
  sender_name: string;
  sender_address: string;
  sender_city: string;
  sender_country: string;
  sender_postal_code: string;
  receiver_name: string;
  receiver_address: string;
  receiver_city: string;
  receiver_country: string;
  receiver_postal_code: string;
}

// PDF generation options with customizable CMR fields
export interface PdfGenerationOptions {
  isNativeMobile?: boolean;
  cmrOptions?: {
    totalPallets?: number;
    totalBags?: number;
    grossWeightPallets?: number;
    grossWeightBags?: number;
    tareWeight?: number;
  };
}

// Fetch shipment data with all details
const fetchShipmentData = async (shipmentId: string): Promise<{
  shipment: Shipment | null;
  details: ShipmentDetail[];
  addressSettings: AddressSettings | null;
}> => {
  try {
    // Fetch shipment
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select(`
        id,
        driver_name,
        departure_date,
        arrival_date,
        status,
        seal_no,
        truck_reg_no,
        trailer_reg_no,
        created_at,
        carrier:carrier_id (name),
        subcarrier:subcarrier_id (name)
      `)
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw shipmentError;
    
    // Fetch shipment details
    const { data: detailsData, error: detailsError } = await supabase
      .from('shipment_details')
      .select(`
        id,
        shipment_id,
        number_of_pallets,
        number_of_bags,
        gross_weight,
        tare_weight,
        net_weight,
        dispatch_number,
        customer:customer_id (name, is_asendia),
        service:service_id (name),
        format:format_id (name),
        prior_format:prior_format_id (name),
        eco_format:eco_format_id (name),
        s3c_format:s3c_format_id (name),
        doe:doe_id (name),
        created_at
      `)
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: true });
      
    if (detailsError) throw detailsError;

    // Fetch address settings
    const { data: addressData, error: addressError } = await supabase
      .from('address_settings')
      .select('*')
      .limit(1)
      .single();

    if (addressError && addressError.code !== 'PGRST116') { // PGRST116 is "no rows returned" - not a critical error
      console.warn('Error fetching address settings:', addressError);
    }
    
    return {
      shipment: shipmentData,
      details: detailsData || [],
      addressSettings: addressData
    };
  } catch (error) {
    console.error('Error fetching shipment data for PDF:', error);
    throw error;
  }
};

// Calculate summary data for a shipment
const calculateShipmentSummary = (details: ShipmentDetail[]) => {
  const summary = {
    totalPallets: 0,
    totalBags: 0,
    totalGrossWeight: 0,
    totalTareWeight: 0,
    totalNetWeight: 0,
    asendiaNetWeight: 0,
    otherNetWeight: 0
  };

  details.forEach(detail => {
    summary.totalPallets += detail.number_of_pallets;
    summary.totalBags += detail.number_of_bags;
    summary.totalGrossWeight += Number(detail.gross_weight);
    summary.totalTareWeight += Number(detail.tare_weight);
    summary.totalNetWeight += Number(detail.net_weight);
    
    if (detail.customer?.is_asendia) {
      summary.asendiaNetWeight += Number(detail.net_weight);
    } else {
      summary.otherNetWeight += Number(detail.net_weight);
    }
  });

  return summary;
};

// Generate Pre-Alert PDF
export const generatePreAlertPDF = async (shipmentId: string, options?: PdfGenerationOptions): Promise<string> => {
  const { shipment, details, addressSettings } = await fetchShipmentData(shipmentId);
  
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  const doc = new jsPDF();
  const summary = calculateShipmentSummary(details);
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('Shipment Completion Report', 105, 20, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(0, 51, 102);
  doc.line(20, 25, 190, 25);
  
  // Add shipment information
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Main Shipment Details:', 20, 35);
  
  // Setup table for main details
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const mainDetails = [
    { label: 'Date Departure:', value: format(new Date(shipment.departure_date), 'dd/MM/yyyy') },
    { label: 'Arrival Date:', value: format(new Date(shipment.arrival_date), 'dd/MM/yyyy') },
    { label: 'Carrier:', value: shipment.carrier?.name || 'N/A' },
    { label: 'Subcarrier:', value: shipment.subcarrier?.name || 'N/A' },
    { label: 'Driver Name:', value: shipment.driver_name },
    { label: 'Truck Reg No:', value: shipment.truck_reg_no || 'N/A' },
    { label: 'Trailer Reg No:', value: shipment.trailer_reg_no || 'N/A' },
    { label: 'Seal No:', value: shipment.seal_no || 'N/A' },
    { label: 'Total Gross Weight:', value: `${summary.totalGrossWeight.toFixed(2)} kg` },
    { label: 'Total Net Weight:', value: `${summary.totalNetWeight.toFixed(2)} kg` },
    { label: 'Total Pallets:', value: summary.totalPallets.toString() },
    { label: 'Total Bags:', value: summary.totalBags.toString() }
  ];

  // Draw main details table
  let y = 40;
  mainDetails.forEach(detail => {
    doc.rect(20, y, 80, 8);
    doc.rect(100, y, 90, 8);
    doc.text(detail.label, 22, y + 5);
    doc.text(detail.value, 102, y + 5);
    y += 8;
  });
  
  // Add shipment details section
  y += 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Shipment Details:', 20, y);
  y += 10;
  
  // Define columns for the details table
  const headers = [
    'Customer', 
    'Service', 
    'Format', 
    'Tare Weight', 
    'Gross Weight', 
    'Net Weight',
    'Dispatch No.', 
    'DOE'
  ];
  
  // Prepare data for the table
  const tableData = details.map(detail => {
    const formatName = (() => {
      if (detail.service?.name === 'Prior' && detail.prior_format) {
        return detail.prior_format.name;
      } else if (detail.service?.name === 'Eco' && detail.eco_format) {
        return detail.eco_format.name;
      } else if (detail.service?.name === 'S3C' && detail.s3c_format) {
        return detail.s3c_format.name;
      } else {
        return detail.format?.name || 'N/A';
      }
    })();
    
    return [
      detail.customer?.name || 'N/A',
      detail.service?.name || 'N/A',
      formatName,
      `${Number(detail.tare_weight).toFixed(2)} kg`,
      `${Number(detail.gross_weight).toFixed(2)} kg`,
      `${Number(detail.net_weight).toFixed(2)} kg`,
      detail.dispatch_number || 'N/A',
      detail.doe?.name || 'N/A'
    ];
  });
  
  // Generate the table
  doc.autoTable({
    startY: y,
    head: [headers],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    margin: { top: 10 },
    styles: { overflow: 'linebreak' },
    columnStyles: { 
      0: { cellWidth: 30 },
      1: { cellWidth: 20 },
      2: { cellWidth: 25 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    }
  });
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};

// Generate CMR PDF
export const generateCMRPDF = async (shipmentId: string, options?: PdfGenerationOptions): Promise<string> => {
  const { shipment, details, addressSettings } = await fetchShipmentData(shipmentId);
  
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  const doc = new jsPDF();
  const summary = calculateShipmentSummary(details);
  
  // Get CMR customization options with defaults
  const cmrOptions = options?.cmrOptions || {};
  const totalPallets = cmrOptions.totalPallets !== undefined ? cmrOptions.totalPallets : summary.totalPallets;
  const totalBags = cmrOptions.totalBags !== undefined ? cmrOptions.totalBags : summary.totalBags;
  
  // Calculate weights based on inputs or use summary data
  const grossWeightPallets = cmrOptions.grossWeightPallets !== undefined ? cmrOptions.grossWeightPallets : summary.totalGrossWeight;
  const grossWeightBags = cmrOptions.grossWeightBags !== undefined ? cmrOptions.grossWeightBags : 0;
  const totalGrossWeight = grossWeightPallets + grossWeightBags;
  
  // Calculate tare weight based on specified logic
  let tareWeight = summary.totalTareWeight;
  
  if (cmrOptions.tareWeight !== undefined) {
    tareWeight = cmrOptions.tareWeight;
  } else if (totalBags > 0 && totalPallets === 0) {
    tareWeight = totalBags * 0.125;
  }
  
  // Set default font
  doc.setFont("helvetica");
  
  // Add title and subtitle centered at the top
  doc.setFontSize(16);
  doc.text('CMR Document', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('International Consignment Note', 105, 30, { align: 'center' });
  
  // Sender section
  doc.setFontSize(12);
  doc.text('1. Sender', 14, 45);
  doc.setFontSize(10);
  
  // Use address settings if available, otherwise use defaults
  if (addressSettings) {
    doc.text(addressSettings.sender_name, 14, 50);
    doc.text(addressSettings.sender_address, 14, 55);
    doc.text(`${addressSettings.sender_postal_code} ${addressSettings.sender_city}, ${addressSettings.sender_country}`, 14, 60);
  } else {
    doc.text('Swift Logistics Ltd.', 14, 50);
    doc.text('123 Transport Road', 14, 55);
    doc.text('London, UK', 14, 60);
  }
  
  // Receiver section
  doc.setFontSize(12);
  doc.text('2. Consignee', 14, 75);
  doc.setFontSize(10);
  
  // Use address settings if available, otherwise use defaults
  if (addressSettings) {
    doc.text(addressSettings.receiver_name, 14, 80);
    doc.text(addressSettings.receiver_address, 14, 85);
    doc.text(`${addressSettings.receiver_postal_code} ${addressSettings.receiver_city}, ${addressSettings.receiver_country}`, 14, 90);
  } else {
    doc.text('La Poste Rte Du Baste De Laval', 14, 80);
    doc.text('Relays #6', 14, 85);
    doc.text('France', 14, 90);
  }
  
  // Carrier section
  doc.setFontSize(12);
  doc.text('3. Carrier', 14, 105);
  doc.setFontSize(10);
  doc.text(`${shipment.carrier?.name || 'N/A'} - ${shipment.subcarrier?.name || 'N/A'}`, 14, 110);
  doc.text(`Driver: ${shipment.driver_name}`, 14, 115);
  
  // Vehicle details
  doc.setFontSize(12);
  doc.text('4. Vehicle Details', 14, 130);
  doc.setFontSize(10);
  doc.text(`Truck Reg No: ${shipment.truck_reg_no || 'N/A'}`, 14, 135);
  doc.text(`Trailer Reg No: ${shipment.trailer_reg_no || 'N/A'}`, 14, 140);
  doc.text(`Seal No: ${shipment.seal_no || 'N/A'}`, 14, 145);
  
  // Goods summary
  doc.setFontSize(12);
  doc.text('5. Goods Summary', 14, 160);
  doc.setFontSize(10);
  doc.text(`Total Pallets: ${totalPallets}`, 14, 165);
  doc.text(`Total Bags: ${totalBags}`, 14, 170);
  doc.text(`Gross Weight: ${totalGrossWeight.toFixed(2)} kg`, 14, 175);
  doc.text(`Tare Weight: ${tareWeight.toFixed(2)} kg`, 14, 180);
  doc.text(`Net Weight: ${(totalGrossWeight - tareWeight).toFixed(2)} kg`, 14, 185);
  
  // Date and place
  doc.setFontSize(12);
  doc.text('6. Date & Place', 14, 200);
  doc.setFontSize(10);
  doc.text(`Departure: ${format(new Date(shipment.departure_date), 'dd/MM/yyyy')}`, 14, 205);
  doc.text(`Expected Arrival: ${format(new Date(shipment.arrival_date), 'dd/MM/yyyy')}`, 14, 210);
  
  // Signature fields
  doc.setFontSize(12);
  doc.text('7. Signatures', 14, 225);
  
  // Add signature boxes
  doc.rect(14, 230, 60, 25); // Sender signature
  doc.rect(84, 230, 60, 25); // Carrier signature
  doc.rect(154, 230, 60, 25); // Consignee signature
  
  doc.setFontSize(8);
  doc.text('Sender', 44, 260);
  doc.text('Carrier', 114, 260);
  doc.text('Consignee', 184, 260);
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};

// Download PDF - now supports both web browsers and mobile devices
export const downloadPDF = async (dataUri: string, fileName: string, isNativeMobile: boolean = false) => {
  try {
    if (isNativeMobile) {
      // On mobile, save to device storage
      const response = await fetch(dataUri);
      const blob = await response.blob();
      await saveFile(blob, fileName);
    } else {
      // On web, use standard browser download
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download or save the PDF file');
  }
};
