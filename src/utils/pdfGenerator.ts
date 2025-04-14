
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
  
  // Set up the document
  doc.setFont("helvetica", "bold");
  
  // Add header
  doc.setFontSize(16);
  doc.text('CRM', 105, 15, { align: 'center' });
  doc.setFontSize(12);
  doc.text('INTERNATIONAL CONSIGNMENT NOTE', 105, 22, { align: 'center' });
  
  // Add border around entire page
  doc.rect(10, 30, 190, 250);
  
  // First row with sender and declaration
  doc.rect(10, 30, 95, 40); // Left box for sender
  doc.rect(105, 30, 95, 40); // Right box for declaration
  
  // Add "Sender" label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('SENDER (NAME, ADDRESS, COUNTRY)', 12, 37);
  
  // Sender content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (addressSettings) {
    doc.text(addressSettings.sender_name, 12, 40);
    doc.text(`Unit ${addressSettings.sender_address}`, 12, 45);
    doc.text(`${addressSettings.sender_city}`, 12, 50);
    doc.text(`${addressSettings.sender_postal_code}`, 12, 55);
    doc.text(`${addressSettings.sender_country}`, 12, 60);
  } else {
    doc.text('Asendia UK', 12, 40);
    doc.text('Unit 1-12 Heathrow Estate', 12, 45);
    doc.text('Silver Jubilee way', 12, 50);
    doc.text('Hounslow', 12, 55);
    doc.text('TW4 6NF', 12, 60);
  }
  
  // Add "Declaration" label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('INTERNATIONAL CONSIGNMENT NOTE', 107, 37);
  
  // Second row with consignee
  doc.rect(10, 70, 95, 40); // Left box for consignee
  doc.rect(105, 70, 95, 40); // Right box for sender/agent reference
  
  // Add "Consignee" label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CONSIGNEE (FINAL DELIVERY POINT NAME, ADDRESS)', 12, 75);
  
  // Consignee content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  if (addressSettings) {
    doc.text(addressSettings.receiver_name, 12, 85);
    doc.text(addressSettings.receiver_address, 12, 95);
    doc.text(`${addressSettings.receiver_country}`, 12, 100);
  } else {
    doc.text('La Poste, Rte Du Baste De Laval, Relays 95,', 12, 85);
    doc.text('France', 12, 95);
  }
  
  // Add "Sender/Agent reference" label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text("SENDER/AGENT REFERENCE", 107, 75);
  
  // Third row with carrier information
  doc.rect(10, 110, 95, 40); // Left box
  doc.rect(105, 110, 95, 40); // Right box
  
  // Add carrier label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CARRIER NAME, ADDRESS, COUNTRY', 12, 115);
  
  // Carrier content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Carrier Name:`, 12, 125);
  doc.text(`${shipment.carrier?.name || 'N/A'} ${shipment.subcarrier?.name ? `- ${shipment.subcarrier.name}` : ''}`, 50, 125);
  doc.text(`TRUCK & TRAILER:`, 12, 135);
  doc.text(`${shipment.truck_reg_no || 'N/A'} / ${shipment.trailer_reg_no || 'N/A'}`, 50, 135);
  
  // Fourth row
  doc.rect(10, 150, 95, 70); // Left box
  doc.rect(105, 150, 95, 70); // Right box
  
  // Add goods label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('MARKS, NOs, No. & KIND OF PACKAGES, DESCRIPTION OF GOODS', 12, 155);
  
  // Goods content
  doc.setFontSize(10);
  doc.text(`Pallets: ${totalPallets}`, 12, 165);
  doc.text(`Bags: ${totalBags}`, 12, 175);
  doc.text(`SEAL #1 Number: ${shipment.seal_no || 'N/A'}`, 12, 185);
  doc.text(`SEAL #2 Number: `, 12, 195);
  doc.text(`Description of Goods: cross border eCommerce B2C parcels`, 12, 205);
  
  // Add weight label on the right - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('GROSS WEIGHT (KG)', 107, 155);
  doc.text('VOLUME (M³)', 155, 155);
  
  // Weight content
  doc.setFontSize(10);
  doc.text(`${totalGrossWeight.toFixed(2)}`, 115, 170);
  
  // Fifth row
  doc.rect(10, 220, 190, 20); // Full width box
  
  // Charges label - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('CARRIAGE CHARGES (FRAIS DE TRANSPORT)', 12, 225);
  
  // Sixth row with signature boxes
  doc.rect(10, 240, 63, 40); // First signature box
  doc.rect(73, 240, 63, 40); // Second signature box
  doc.rect(136, 240, 64, 40); // Third signature box
  
  // Signature labels - Standardized to 6.5pt bold
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.text('GOODS RECEIVED (MERCHANDISE REÇUE)', 12, 245);
  doc.text('SIGNATURE OF CARRIER', 75, 245);
  doc.text('FOR GOODS, SIGNATURE', 138, 245);
  
  // Signature date fields
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text('Date:', 12, 270);
  doc.text('Date:', 75, 270);
  doc.text('Date: __/__/__', 138, 270);
  
  // Save the PDF
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};
