import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import { Bill, TaxReport } from '../types';
import { UNIT_RATE, TAX_RATE, storeBill, generateMonthlyBills, getBillsByUserId } from './storageUtils';

export const calculateBillAmount = (units: number): { amount: number; tax: number; totalAmount: number } => {
  const amount = units * UNIT_RATE;
  const tax = amount * TAX_RATE;
  const totalAmount = amount + tax;
  return { amount, tax, totalAmount };
};

export const generateBill = (userId: string, units: number): Bill => {
  const { amount, tax, totalAmount } = calculateBillAmount(units);
  const currentDate = new Date();
  const dueDate = new Date(currentDate);
  dueDate.setDate(currentDate.getDate() + 15); // Due date is 15 days from generation
  
  const bill: Bill = {
    id: `BILL${Date.now()}`,
    userId,
    units,
    amount,
    tax,
    totalAmount,
    status: 'Unpaid',
    dueDate: dueDate.toISOString(),
    generatedDate: currentDate.toISOString(),
  };
  
  storeBill(bill);
  return bill;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const generateTaxReport = (userId: string, year: number, month?: number): TaxReport[] => {
  const bills = getBillsByUserId(userId);
  const reports: TaxReport[] = [];

  if (month !== undefined) {
    // Generate report for specific month
    const monthlyBills = bills.filter(bill => {
      const billDate = new Date(bill.generatedDate);
      return billDate.getFullYear() === year && billDate.getMonth() === month;
    });

    if (monthlyBills.length > 0) {
      reports.push(createTaxReport(monthlyBills, year, month));
    }
  } else {
    // Generate report for entire year
    for (let m = 0; m < 12; m++) {
      const monthlyBills = bills.filter(bill => {
        const billDate = new Date(bill.generatedDate);
        return billDate.getFullYear() === year && billDate.getMonth() === m;
      });

      if (monthlyBills.length > 0) {
        reports.push(createTaxReport(monthlyBills, year, m));
      }
    }
  }

  return reports;
};

const createTaxReport = (bills: Bill[], year: number, month: number): TaxReport => {
  const totalBills = bills.length;
  const totalUnits = bills.reduce((sum, bill) => sum + bill.units, 0);
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalTax = bills.reduce((sum, bill) => sum + bill.tax, 0);
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  return {
    year,
    month,
    totalBills,
    totalUnits,
    totalAmount,
    totalTax,
    totalRevenue
  };
};

export const downloadTaxReport = (reports: TaxReport[], year: number): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Add title
  doc.setFontSize(18);
  doc.text(`Tax Report - ${year}`, pageWidth / 2, 20, { align: 'center' });

  // Add table headers
  doc.setFontSize(12);
  const headers = ['Month', 'Bills', 'Units', 'Amount', 'Tax', 'Total'];
  let y = 40;

  headers.forEach((header, i) => {
    doc.text(header, 20 + (i * 30), y);
  });

  y += 10;

  // Add table data
  reports.forEach(report => {
    const month = new Date(year, report.month).toLocaleString('default', { month: 'short' });
    const row = [
      month,
      report.totalBills.toString(),
      report.totalUnits.toString(),
      formatCurrency(report.totalAmount),
      formatCurrency(report.totalTax),
      formatCurrency(report.totalRevenue)
    ];

    row.forEach((cell, i) => {
      doc.text(cell, 20 + (i * 30), y);
    });

    y += 10;
  });

  // Add totals
  const totals = reports.reduce((acc, report) => ({
    totalBills: acc.totalBills + report.totalBills,
    totalUnits: acc.totalUnits + report.totalUnits,
    totalAmount: acc.totalAmount + report.totalAmount,
    totalTax: acc.totalTax + report.totalTax,
    totalRevenue: acc.totalRevenue + report.totalRevenue
  }), {
    totalBills: 0,
    totalUnits: 0,
    totalAmount: 0,
    totalTax: 0,
    totalRevenue: 0
  });

  y += 10;
  doc.setFont(undefined, 'bold');
  doc.text('Total', 20, y);
  doc.text(totals.totalBills.toString(), 50, y);
  doc.text(totals.totalUnits.toString(), 80, y);
  doc.text(formatCurrency(totals.totalAmount), 110, y);
  doc.text(formatCurrency(totals.totalTax), 140, y);
  doc.text(formatCurrency(totals.totalRevenue), 170, y);

  // Save the PDF
  const blob = doc.output('blob');
  saveAs(blob, `tax_report_${year}.pdf`);
};

// Check and generate monthly bills
export const checkAndGenerateMonthlyBills = () => {
  const now = new Date();
  const lastCheck = localStorage.getItem('lastBillCheck');
  
  if (lastCheck) {
    const lastCheckDate = new Date(lastCheck);
    if (
      lastCheckDate.getMonth() !== now.getMonth() ||
      lastCheckDate.getFullYear() !== now.getFullYear()
    ) {
      generateMonthlyBills();
    }
  } else {
    generateMonthlyBills();
  }
  
  localStorage.setItem('lastBillCheck', now.toISOString());
};