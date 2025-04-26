import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { toast as sonner } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getBillsByUserId } from '../utils/storageUtils';
import { Bill } from '../types';
import { formatCurrency, formatDate } from '../utils/billUtils';

const DueReminder: React.FC = () => {
  const { currentUser } = useAuth();
  const [dueBills, setDueBills] = useState<Bill[]>([]);

  useEffect(() => {
    if (currentUser) {
      checkDueBills();
      // Check every hour
      const interval = setInterval(checkDueBills, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const checkDueBills = () => {
    if (!currentUser) return;

    const bills = getBillsByUserId(currentUser.id);
    const now = new Date();
    const unpaidBills = bills.filter(bill => {
      if (bill.status === 'Unpaid') {
        const dueDate = new Date(bill.dueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilDue <= 3 && daysUntilDue >= 0;
      }
      return false;
    });

    setDueBills(unpaidBills);

    // Show notifications for bills due soon
    unpaidBills.forEach(bill => {
      const dueDate = new Date(bill.dueDate);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue === 0) {
        toast.error(`Bill #${bill.id.substring(0, 8)} is due today! Amount: ${formatCurrency(bill.totalAmount)}`);
        sonner.error('Bill Due Today!', {
          description: `Bill #${bill.id.substring(0, 8)} for ${formatCurrency(bill.totalAmount)} is due today!`,
          duration: 0,
          action: {
            label: 'Pay Now',
            onClick: () => window.location.href = '/bill-history'
          }
        });
      } else {
        toast.warning(`Bill #${bill.id.substring(0, 8)} is due in ${daysUntilDue} days! Amount: ${formatCurrency(bill.totalAmount)}`);
        sonner.warning('Upcoming Bill Due', {
          description: `Bill #${bill.id.substring(0, 8)} for ${formatCurrency(bill.totalAmount)} is due in ${daysUntilDue} days`,
          duration: 10000,
          action: {
            label: 'View Bill',
            onClick: () => window.location.href = '/bill-history'
          }
        });
      }
    });
  };

  if (dueBills.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-center mb-3">
          <Bell className="text-red-500 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Payment Reminders</h3>
        </div>
        <div className="space-y-3">
          {dueBills.map(bill => (
            <div key={bill.id} className="border-b border-gray-200 pb-2 last:border-0">
              <p className="text-sm text-gray-600">
                Bill #{bill.id.substring(0, 8)}
              </p>
              <p className="text-sm font-medium text-gray-900">
                Amount: {formatCurrency(bill.totalAmount)}
              </p>
              <p className="text-sm text-red-600">
                Due: {formatDate(bill.dueDate)}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => window.location.href = '/bill-history'}
          className="mt-3 w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View All Bills
        </button>
      </div>
    </div>
  );
};

export default DueReminder;