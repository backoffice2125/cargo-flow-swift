
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { saveFile } from "@/utils/mobileHelper";
import { format } from "date-fns";

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
  logoImgData?: string; // Base64 data URL for logo
}

// Generate filename with the pattern: [Type], [Seal No], [Date in dd-MM-yy], [Current Time in HH:mm:ss]
const generateFileName = (type: 'CMR' | 'Pre-Alert', shipment: Shipment): string => {
  const sealNo = shipment.seal_no || 'NoSeal';
  const departureDate = format(new Date(shipment.departure_date), 'dd-MM-yy');
  const currentTime = format(new Date(), 'HH:mm:ss');
  
  return `${type}, ${sealNo}, ${departureDate} ${currentTime}.pdf`;
};

// Helper function to add logo to PDF - fixed to ensure consistent positioning
const addLogoToPdf = (doc: jsPDF, logoImgData?: string) => {
  if (logoImgData) {
    try {
      console.log("pdfGenerator: Adding logo to PDF. Logo data starts with:", logoImgData.substring(0, 50));
      
      // Add logo at the top center of the page
      // Size the logo appropriately (50mm width)
      const logoWidth = 50;
      const pageWidth = doc.internal.pageSize.getWidth();
      const xPosition = (pageWidth / 2) - (logoWidth / 2);
      
      // Check if logo data is valid
      if (!logoImgData || logoImgData.trim() === '') {
        console.error('Invalid logo data provided');
        return;
      }
      
      // Extract format from data URL
      const format = logoImgData.split(';')[0].split('/')[1];
      console.log("pdfGenerator: Detected image format:", format);
      
      // Using addImage with explicit format specification
      doc.addImage(logoImgData, format, xPosition, 5, logoWidth, 15);
      console.log("pdfGenerator: Logo added successfully at position:", xPosition, 5);
    } catch (error) {
      console.error('Error adding logo to PDF:', error);
      // Continue without logo if there's an error
    }
  } else {
    console.log("pdfGenerator: No logo data provided to add to PDF");
  }
};

// Fetch shipment data with all details
export const fetchShipmentData = async (shipmentId: string): Promise<{
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
export const calculateShipmentSummary = (details: ShipmentDetail[]) => {
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
  
  console.log("pdfGenerator: Generating Pre-Alert PDF with logo:", 
    options?.logoImgData ? "Logo provided (starts with: " + options.logoImgData.substring(0, 30) + "...)" : "No logo");
  
  // Add logo at the top if provided
  if (options?.logoImgData) {
    addLogoToPdf(doc, options.logoImgData);
    console.log("pdfGenerator: Logo processing completed for Pre-Alert PDF");
  } else {
    console.log("pdfGenerator: No logo provided for Pre-Alert PDF");
  }
  
  // Adjust starting Y position based on whether logo is added
  const startY = options?.logoImgData ? 25 : 20;
  
  // Add header
  doc.setFontSize(20);
  doc.setTextColor(0, 51, 102);
  doc.text('Shipment Completion Report', 105, startY, { align: 'center' });
  
  // Add horizontal line
  doc.setDrawColor(0, 51, 102);
  doc.line(20, startY + 5, 190, startY + 5);
  
  // Add shipment information
  doc.setFontSize(14);
  doc.setTextColor(0, 51, 102);
  doc.text('Main Shipment Details:', 20, startY + 15);
  
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
  let y = startY + 20;
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
  
  // Generate the table using autoTable
  autoTable(doc, {
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
  console.log("pdfGenerator: Pre-Alert PDF generated successfully");
  return pdfOutput;
};

export const generateCMRPDF = async (shipmentId: string, options?: PdfGenerationOptions): Promise<string> => {
  const { shipment, details, addressSettings } = await fetchShipmentData(shipmentId);
  
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  const doc = new jsPDF();
  const summary = calculateShipmentSummary(details);
  
  console.log("pdfGenerator: Generating CMR PDF with logo:", 
    options?.logoImgData ? "Logo provided (starts with: " + options.logoImgData.substring(0, 30) + "...)" : "No logo");
  
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
  
  // Format today's date for the signature fields
  const currentDate = format(new Date(), 'dd/MM/yy');
  
  // Add logo at the top if provided
  if (options?.logoImgData) {
    addLogoToPdf(doc, options.logoImgData);
    console.log("pdfGenerator: Logo processing completed for CMR PDF");
  } else {
    console.log("pdfGenerator: No logo provided for CMR PDF");
  }
  
  // Adjust starting Y position based on whether logo is added
  const startY = options?.logoImgData ? 25 : 15;
  
  // Set up the document
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8); // Standardize content text to 8pt normal font
  
  // Add header
  doc.setFontSize(16);
  doc.text('CRM', 105, startY, { align: 'center' });
  doc.setFontSize(12);
  doc.text('INTERNATIONAL CONSIGNMENT NOTE', 105, startY + 7, { align: 'center' });
  
  // Add border around entire page
  doc.rect(10, startY + 15, 190, 250);
  
  // First row with sender and declaration
  doc.rect(10, startY + 15, 95, 40); // Left box for sender
  doc.rect(105, startY + 15, 95, 40); // Right box for declaration
  
  // Add "Sender" label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('SENDER (NAME, ADDRESS, COUNTRY)', 12, startY + 22);
  
  // Sender content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (addressSettings) {
    doc.text(addressSettings.sender_name, 12, startY + 25);
    doc.text(`Unit ${addressSettings.sender_address}`, 12, startY + 30);
    doc.text(`${addressSettings.sender_city}`, 12, startY + 35);
    doc.text(`${addressSettings.sender_postal_code}`, 12, startY + 40);
    doc.text(`${addressSettings.sender_country}`, 12, startY + 45);
  } else {
    doc.text('Asendia UK', 12, startY + 25);
    doc.text('Unit 1-12 Heathrow Estate', 12, startY + 30);
    doc.text('Silver Jubilee way', 12, startY + 35);
    doc.text('Hounslow', 12, startY + 40);
    doc.text('TW4 6NF', 12, startY + 45);
  }
  
  // Add "Declaration" label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('INTERNATIONAL CONSIGNMENT NOTE', 107, startY + 22);
  
  // Continue with the rest of the CMR document with adjusted Y positions
  // Second row with consignee
  doc.rect(10, startY + 55, 95, 40); // Left box for consignee
  doc.rect(105, startY + 55, 95, 40); // Right box for sender/agent reference
  
  // Add "Consignee" label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CONSIGNEE (FINAL DELIVERY POINT NAME, ADDRESS)', 12, startY + 60);
  
  // Consignee content - Updated to include city and postal code
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  if (addressSettings) {
    doc.text(addressSettings.receiver_name, 12, startY + 70);
    doc.text(addressSettings.receiver_address, 12, startY + 75);
    doc.text(`${addressSettings.receiver_city}, ${addressSettings.receiver_postal_code}`, 12, startY + 80);
    doc.text(`${addressSettings.receiver_country}`, 12, startY + 85);
  } else {
    doc.text('La Poste, Rte Du Baste De Laval, Relays 95,', 12, startY + 70);
    doc.text('Paris, 75001', 12, startY + 75);
    doc.text('France', 12, startY + 80);
  }
  
  // Add "Sender/Agent reference" label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("SENDER/AGENT REFERENCE", 107, startY + 60);
  
  // Third row with carrier information
  doc.rect(10, startY + 95, 95, 40); // Left box
  doc.rect(105, startY + 95, 95, 40); // Right box
  
  // Add carrier label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CARRIER NAME, ADDRESS, COUNTRY', 12, startY + 100);
  
  // Carrier content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Carrier Name:`, 12, startY + 110);
  doc.text(`${shipment.carrier?.name || 'N/A'} ${shipment.subcarrier?.name ? `- ${shipment.subcarrier.name}` : ''}`, 50, startY + 110);
  doc.text(`TRUCK & TRAILER:`, 12, startY + 120);
  doc.text(`${shipment.truck_reg_no || 'N/A'} / ${shipment.trailer_reg_no || 'N/A'}`, 50, startY + 120);
  
  // Fourth row
  doc.rect(10, startY + 135, 95, 70); // Left box
  doc.rect(105, startY + 135, 95, 70); // Right box
  
  // Add goods label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('MARKS, NOs, No. & KIND OF PACKAGES, DESCRIPTION OF GOODS', 12, startY + 140);
  
  // Goods content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Pallets: ${totalPallets}`, 12, startY + 150);
  doc.text(`Bags: ${totalBags}`, 12, startY + 160);
  doc.text(`SEAL #1 Number: ${shipment.seal_no || 'N/A'}`, 12, startY + 170);
  doc.text(`SEAL #2 Number: `, 12, startY + 180);
  doc.text(`Description of Goods: cross border eCommerce B2C parcels`, 12, startY + 190);
  
  // Add weight label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('GROSS WEIGHT (KG)', 107, startY + 140);
  doc.text('VOLUME (M³)', 155, startY + 140);
  
  // Weight content - Updated to show detailed breakdown
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text('Gross Weight of Pallets:', 107, startY + 150);
  doc.text(`${grossWeightPallets.toFixed(2)} kg`, 165, startY + 150);
  
  doc.text('Gross Weight of Bags:', 107, startY + 160);
  doc.text(`${grossWeightBags.toFixed(2)} kg`, 165, startY + 160);
  
  doc.text('Total Gross Weight:', 107, startY + 170);
  doc.text(`${totalGrossWeight.toFixed(2)} kg`, 165, startY + 170);
  
  // Fifth row
  doc.rect(10, startY + 205, 190, 20); // Full width box
  
  // Charges label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CARRIAGE CHARGES (FRAIS DE TRANSPORT)', 12, startY + 210);
  
  // Sixth row with signature boxes
  doc.rect(10, startY + 225, 63, 40); // First signature box
  doc.rect(73, startY + 225, 63, 40); // Second signature box
  doc.rect(136, startY + 225, 64, 40); // Third signature box
  
  // Signature labels - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('GOODS RECEIVED (MERCHANDISE REÇUE)', 12, startY + 230);
  doc.text('SIGNATURE OF CARRIER', 75, startY + 230);
  doc.text('FOR GOODS, SIGNATURE', 138, startY + 230);
  
  // Signature date fields - now with today's date for the first two fields
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Date: ${currentDate}`, 12, startY + 255);
  doc.text(`Date: ${currentDate}`, 75, startY + 255);
  doc.text('Date: __/__/__', 138, startY + 255);
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  console.log("pdfGenerator: CMR PDF generated successfully");
  return pdfOutput;
};

// Download PDF - now supports both web browsers and mobile devices
export const downloadPDF = async (dataUri: string, fileName: string, isNativeMobile: boolean = false) => {
  console.log(`pdfGenerator: Downloading PDF "${fileName}" (isNativeMobile: ${isNativeMobile})`);
  try {
    if (isNativeMobile) {
      // On mobile, save to device storage
      const response = await fetch(dataUri);
      const blob = await response.blob();
      await saveFile(blob, fileName);
      console.log("pdfGenerator: PDF saved to mobile device");
    } else {
      // On web, use standard browser download
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("pdfGenerator: PDF downloaded in browser");
    }
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download or save the PDF file');
  }
};
