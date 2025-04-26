import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { generateBill, formatCurrency } from '../utils/billUtils';
import { getMeterReading, getLastReading, storeReading } from '../utils/meterUtils';
import { initializePayment } from '../utils/paymentUtils';
import { UNIT_RATE, TAX_RATE } from '../utils/storageUtils';
import { Bill } from '../types';
import { useNavigate } from 'react-router-dom';

const BillGenerationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [meterReading, setMeterReading] = useState<number | null>(null);
  const [lastReading, setLastReading] = useState<number>(0);
  const [unitsConsumed, setUnitsConsumed] = useState<number>(0);

  useEffect(() => {
    if (currentUser) {
      fetchMeterReading();
    }
  }, [currentUser]);

  const fetchMeterReading = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const reading = await getMeterReading(currentUser.meterNo);
      const last = getLastReading(currentUser.meterNo);
      
      setMeterReading(reading);
      setLastReading(last);
      const units = reading - last;
      if (units < 0) {
        throw new Error('Invalid meter reading: negative units consumed');
      }
      setUnitsConsumed(units);
      
      storeReading(currentUser.meterNo, reading);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch meter reading');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!currentUser || !meterReading) {
      toast.error('Unable to generate bill');
      return;
    }

    if (unitsConsumed <= 0) {
      toast.error('Invalid units consumed');
      return;
    }

    try {
      const bill = generateBill(currentUser.id, unitsConsumed);
      setGeneratedBill(bill);
      toast.success('Bill generated successfully!');
    } catch (error) {
      toast.error('Failed to generate bill');
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!generatedBill || !currentUser) return;

    setIsProcessing(true);
    try {
      await initializePayment({
        amount: generatedBill.totalAmount,
        billId: generatedBill.id,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
      });
    } catch (error) {
      toast.error('Payment failed');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateEstimatedBill = () => {
    const amount = unitsConsumed * UNIT_RATE;
    const tax = amount * TAX_RATE;
    return amount + tax;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generate Bill</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-blue-600">
            <h3 className="text-lg font-medium text-white">Meter Reading</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Meter Number</span>
                    <span className="text-sm text-gray-900">{currentUser?.meterNo}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Current Reading</span>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900">{meterReading || '-'}</span>
                      <button
                        onClick={fetchMeterReading}
                        disabled={isLoading}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Previous Reading</span>
                    <span className="text-sm text-gray-900">{lastReading}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Units Consumed</span>
                    <span className="text-sm text-gray-900">{unitsConsumed}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Rate per Unit</span>
                    <span className="text-sm text-gray-900">{formatCurrency(UNIT_RATE)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm font-medium text-gray-500">GST ({(TAX_RATE * 100)}%)</span>
                    <span className="text-sm text-gray-900">
                      {formatCurrency(unitsConsumed * UNIT_RATE * TAX_RATE)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-base font-medium text-gray-900">Estimated Total</span>
                    <span className="text-base font-medium text-gray-900">
                      {formatCurrency(calculateEstimatedBill())}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleGenerateBill}
                    disabled={isLoading || !meterReading || unitsConsumed <= 0}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {generatedBill && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 bg-green-600">
              <h3 className="text-lg font-medium text-white">Bill Generated</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Bill Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Bill ID</dt>
                      <dd className="text-sm text-gray-900">{generatedBill.id.substring(0, 8)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Generated Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(generatedBill.generatedDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(generatedBill.dueDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Units Consumed</dt>
                      <dd className="text-sm text-gray-900">{generatedBill.units}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="text-sm text-gray-900">{formatCurrency(generatedBill.amount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">GST ({(TAX_RATE * 100)}%)</dt>
                      <dd className="text-sm text-gray-900">{formatCurrency(generatedBill.tax)}</dd>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <dt className="text-base font-medium text-gray-900">Total Amount</dt>
                      <dd className="text-base font-medium text-gray-900">
                        {formatCurrency(generatedBill.totalAmount)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing || generatedBill.status === 'Paid'}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    generatedBill.status === 'Paid'
                      ? 'bg-green-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isProcessing ? 'Processing...' : generatedBill.status === 'Paid' ? 'Paid' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillGenerationPage;