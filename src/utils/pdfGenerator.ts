
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";

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
  seal_no: string;
  truck_reg_no: string;
  trailer_reg_no: string;
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
  dispatch_number: string;
  customer: { name: string; is_asendia: boolean } | null;
  service: { name: string } | null;
  format: { name: string } | null;
  prior_format: { name: string } | null;
  eco_format: { name: string } | null;
  s3c_format: { name: string } | null;
  doe: { name: string } | null;
  created_at: string;
}

// Fetch shipment data with all details
const fetchShipmentData = async (shipmentId: string): Promise<{
  shipment: Shipment | null;
  details: ShipmentDetail[];
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
    
    return {
      shipment: shipmentData,
      details: detailsData || []
    };
  } catch (error) {
    console.error('Error fetching shipment data for PDF:', error);
    throw error;
  }
};

// Generate Pre-Alert PDF
export const generatePreAlertPDF = async (shipmentId: string): Promise<string> => {
  const { shipment, details } = await fetchShipmentData(shipmentId);
  
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('Pre-Alert Document', 105, 20, { align: 'center' });
  
  // Add shipment information
  doc.setFontSize(12);
  doc.text('Shipment Information', 14, 40);
  
  doc.setFontSize(10);
  doc.text(`Carrier: ${shipment.carrier?.name || 'N/A'}`, 14, 50);
  doc.text(`Subcarrier: ${shipment.subcarrier?.name || 'N/A'}`, 14, 55);
  doc.text(`Driver: ${shipment.driver_name}`, 14, 60);
  doc.text(`Departure Date: ${new Date(shipment.departure_date).toLocaleDateString()}`, 14, 65);
  doc.text(`Arrival Date: ${new Date(shipment.arrival_date).toLocaleDateString()}`, 14, 70);
  doc.text(`Seal No: ${shipment.seal_no || 'N/A'}`, 14, 75);
  doc.text(`Truck Reg No: ${shipment.truck_reg_no || 'N/A'}`, 14, 80);
  doc.text(`Trailer Reg No: ${shipment.trailer_reg_no || 'N/A'}`, 14, 85);
  
  // Calculate summary data
  const totalPallets = details.reduce((sum, detail) => sum + detail.number_of_pallets, 0);
  const totalBags = details.reduce((sum, detail) => sum + detail.number_of_bags, 0);
  const totalGrossWeight = details.reduce((sum, detail) => sum + Number(detail.gross_weight), 0);
  const totalTareWeight = details.reduce((sum, detail) => sum + Number(detail.tare_weight), 0);
  const totalNetWeight = details.reduce((sum, detail) => sum + Number(detail.net_weight), 0);
  const asendiaDetails = details.filter(detail => detail.customer?.is_asendia);
  const otherDetails = details.filter(detail => !detail.customer?.is_asendia);
  const totalAsendiaNetWeight = asendiaDetails.reduce((sum, detail) => sum + Number(detail.net_weight), 0);
  const totalOtherNetWeight = otherDetails.reduce((sum, detail) => sum + Number(detail.net_weight), 0);
  
  // Add summary
  doc.setFontSize(12);
  doc.text('Summary', 14, 100);
  
  doc.setFontSize(10);
  doc.text(`Total Pallets: ${totalPallets}`, 14, 110);
  doc.text(`Total Bags: ${totalBags}`, 14, 115);
  doc.text(`Gross Weight: ${totalGrossWeight.toFixed(2)} kg`, 14, 120);
  doc.text(`Tare Weight: ${totalTareWeight.toFixed(2)} kg`, 14, 125);
  doc.text(`Net Weight: ${totalNetWeight.toFixed(2)} kg`, 14, 130);
  
  // Add detail table
  doc.setFontSize(12);
  doc.text('Shipment Details', 14, 145);
  
  // Define the table data
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
      detail.number_of_pallets,
      detail.number_of_bags,
      `${Number(detail.gross_weight).toFixed(2)} kg`,
      `${Number(detail.net_weight).toFixed(2)} kg`,
      detail.dispatch_number || 'N/A'
    ];
  });
  
  // Generate the table
  doc.autoTable({
    startY: 150,
    head: [['Customer', 'Service', 'Format', 'Pallets', 'Bags', 'Gross Weight', 'Net Weight', 'Dispatch No']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 }
  });
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};

// Generate CMR PDF
export const generateCMRPDF = async (shipmentId: string): Promise<string> => {
  const { shipment, details } = await fetchShipmentData(shipmentId);
  
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(20);
  doc.text('CMR Document', 105, 20, { align: 'center' });
  
  // Add subheader
  doc.setFontSize(14);
  doc.text('International Consignment Note', 105, 30, { align: 'center' });
  
  // Sender section
  doc.setFontSize(12);
  doc.text('1. Sender', 14, 45);
  doc.setFontSize(10);
  doc.text('Swift Logistics Ltd.', 14, 50);
  doc.text('123 Transport Road', 14, 55);
  doc.text('London, UK', 14, 60);
  
  // Receiver section
  doc.setFontSize(12);
  doc.text('2. Consignee', 14, 75);
  doc.setFontSize(10);
  doc.text('Various Recipients', 14, 80);
  doc.text('As per attached details', 14, 85);
  
  // Carrier section
  doc.setFontSize(12);
  doc.text('3. Carrier', 14, 100);
  doc.setFontSize(10);
  doc.text(`${shipment.carrier?.name || 'N/A'} - ${shipment.subcarrier?.name || 'N/A'}`, 14, 105);
  doc.text(`Driver: ${shipment.driver_name}`, 14, 110);
  
  // Vehicle details
  doc.setFontSize(12);
  doc.text('4. Vehicle Details', 14, 125);
  doc.setFontSize(10);
  doc.text(`Truck Reg No: ${shipment.truck_reg_no || 'N/A'}`, 14, 130);
  doc.text(`Trailer Reg No: ${shipment.trailer_reg_no || 'N/A'}`, 14, 135);
  doc.text(`Seal No: ${shipment.seal_no || 'N/A'}`, 14, 140);
  
  // Calculate summary data
  const totalPallets = details.reduce((sum, detail) => sum + detail.number_of_pallets, 0);
  const totalBags = details.reduce((sum, detail) => sum + detail.number_of_bags, 0);
  const totalGrossWeight = details.reduce((sum, detail) => sum + Number(detail.gross_weight), 0);
  const totalTareWeight = details.reduce((sum, detail) => sum + Number(detail.tare_weight), 0);
  const totalNetWeight = details.reduce((sum, detail) => sum + Number(detail.net_weight), 0);
  
  // Goods summary
  doc.setFontSize(12);
  doc.text('5. Goods Summary', 14, 155);
  doc.setFontSize(10);
  doc.text(`Total Pallets: ${totalPallets}`, 14, 160);
  doc.text(`Total Bags: ${totalBags}`, 14, 165);
  doc.text(`Gross Weight: ${totalGrossWeight.toFixed(2)} kg`, 14, 170);
  doc.text(`Tare Weight: ${totalTareWeight.toFixed(2)} kg`, 14, 175);
  doc.text(`Net Weight: ${totalNetWeight.toFixed(2)} kg`, 14, 180);
  
  // Date and place
  doc.setFontSize(12);
  doc.text('6. Date & Place', 14, 195);
  doc.setFontSize(10);
  doc.text(`Departure: ${new Date(shipment.departure_date).toLocaleDateString()}`, 14, 200);
  doc.text(`Expected Arrival: ${new Date(shipment.arrival_date).toLocaleDateString()}`, 14, 205);
  
  // Signature fields
  doc.setFontSize(12);
  doc.text('7. Signatures', 14, 220);
  
  // Add signature boxes
  doc.rect(14, 225, 60, 25); // Sender signature
  doc.rect(84, 225, 60, 25); // Carrier signature
  doc.rect(154, 225, 60, 25); // Consignee signature
  
  doc.setFontSize(8);
  doc.text('Sender', 44, 255);
  doc.text('Carrier', 114, 255);
  doc.text('Consignee', 184, 255);
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};

// Download PDF
export const downloadPDF = (dataUri: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
