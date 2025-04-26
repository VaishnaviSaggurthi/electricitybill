import React, { useEffect, useState } from 'react';
import { FileText, Download, FileBarChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBillsByUserId } from '../utils/storageUtils';
import { formatCurrency, formatDate, generateTaxReport, downloadTaxReport } from '../utils/billUtils';
import { Bill, TaxReport } from '../types';

const BillHistoryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [taxReports, setTaxReports] = useState<TaxReport[]>([]);

  useEffect(() => {
    if (currentUser) {
      const userBills = getBillsByUserId(currentUser.id);
      // Sort bills by date (newest first)
      const sortedBills = userBills.sort(
        (a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime()
      );
      setBills(sortedBills);
      
      // Generate tax report for current year
      const reports = generateTaxReport(currentUser.id, selectedYear);
      setTaxReports(reports);
    }
  }, [currentUser, selectedYear]);

  const downloadBill = (bill: Bill) => {
    // In a real app, this would generate a PDF
    // For this demo, we'll create a text representation and download it
    const billText = `
    PowerBill - Electricity Bill
    ---------------------------
    Bill ID: ${bill.id}
    Customer: ${currentUser?.name}
    Meter No: ${currentUser?.meterNo}
    
    Generated Date: ${formatDate(bill.generatedDate)}
    Due Date: ${formatDate(bill.dueDate)}
    
    Units Consumed: ${bill.units}
    Rate per Unit: ₹5.00
    Amount: ${formatCurrency(bill.amount)}
    GST (18%): ${formatCurrency(bill.tax)}
    Total Amount: ${formatCurrency(bill.totalAmount)}
    
    Status: ${bill.status}
    ${bill.paymentId ? `Payment ID: ${bill.paymentId}` : ''}
    
    Thank you for using PowerBill!
    `;

    const blob = new Blob([billText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${bill.id.substring(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTaxReport = () => {
    downloadTaxReport(taxReports, selectedYear);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Bill History</h1>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={handleDownloadTaxReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FileBarChart size={16} className="mr-2" />
            Download Tax Report
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {bills.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {bills.map(bill => (
              <li key={bill.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <p className="ml-2 text-sm font-medium text-blue-600 truncate">
                        Bill #{bill.id.substring(0, 8)}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        bill.status === 'Paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Units: {bill.units}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                        Amount: {formatCurrency(bill.totalAmount)}
                      </p>
                      {bill.paymentId && (
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          Payment ID: {bill.paymentId}
                        </p>
                      )}
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        Generated on {formatDate(bill.generatedDate)}
                      </p>
                      <button
                        onClick={() => downloadBill(bill)}
                        className="ml-4 text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <Download size={16} className="mr-1" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Due: {formatDate(bill.dueDate)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bills found</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't generated any bills yet.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => window.location.href = '/generate-bill'}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Generate a bill
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillHistoryPage;