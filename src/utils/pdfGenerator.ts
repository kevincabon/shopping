import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PDFProduct } from '../types/pdf';
import { formatPrice } from './utils';

interface GeneratePDFParams {
  products: PDFProduct[];
  storeName: string;
  total: number;
  date: Date;
}

export function generateShoppingListPDF({
  products,
  storeName,
  total,
  date
}: GeneratePDFParams): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Liste de courses', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Magasin: ${storeName}`, 20, 35);
  doc.text(`Date: ${date.toLocaleDateString('fr-FR')}`, 20, 42);

  // Table
  const tableData = products.map(product => [
    product.name,
    formatPrice(product.price),
    product.quantity.toString(),
    formatPrice(product.price * product.quantity)
  ]);

  (doc as any).autoTable({
    startY: 50,
    head: [['Produit', 'Prix unitaire', 'Quantité', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 10
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 35, halign: 'right' }
    },
    margin: { top: 50 }
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY || 50;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total: ${formatPrice(total)}`, 190, finalY + 10, { align: 'right' });

  return doc;
}