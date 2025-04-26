import { Bill } from '../types';
import { getStoredBills } from './storageUtils';
import { toast } from 'react-hot-toast';
import { toast as sonner } from 'sonner';

interface PaymentOptions {
  amount: number;
  billId: string;
  customerName: string;
  customerEmail: string;
}

export const initializePayment = async (options: PaymentOptions): Promise<void> => {
  const { amount, billId, customerName, customerEmail } = options;

  const loadingToast = toast.loading('Processing payment...');
  sonner.loading('Initializing payment...', {
    description: 'Please wait while we process your payment'
  });

  try {
    // Create a Razorpay order
    const order = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: billId,
    };

    // For demo purposes, we'll simulate a successful payment after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    const paymentId = `PAY_${Date.now()}`;

    await handlePaymentSuccess(billId, paymentId);
    toast.dismiss(loadingToast);
    toast.success('Payment successful!');
    sonner.success('Payment completed', {
      description: `Payment ID: ${paymentId}`,
      duration: 5000,
    });

    // Delay navigation slightly to ensure notifications are visible
    setTimeout(() => {
      window.location.href = '/bill-history';
    }, 1500);
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error('Payment failed. Please try again.');
    sonner.error('Payment failed', {
      description: 'There was an error processing your payment. Please try again.',
    });
    console.error('Payment error:', error);
  }
};

const handlePaymentSuccess = async (billId: string, paymentId: string): Promise<void> => {
  const bills = getStoredBills();
  const billIndex = bills.findIndex((b: Bill) => b.id === billId);
  
  if (billIndex !== -1) {
    bills[billIndex].status = 'Paid';
    bills[billIndex].paidDate = new Date().toISOString();
    bills[billIndex].paymentId = paymentId;
    localStorage.setItem('bills', JSON.stringify(bills));
  }
};