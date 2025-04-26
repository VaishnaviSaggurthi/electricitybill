import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, FilePlus, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBillsByUserId } from '../utils/storageUtils';
import { formatCurrency, formatDate } from '../utils/billUtils';
import { Bill } from '../types';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState({
    totalBills: 0,
    unpaidBills: 0,
    totalUnits: 0,
    totalDue: 0,
  });

  useEffect(() => {
    if (currentUser) {
      const userBills = getBillsByUserId(currentUser.id);
      setBills(userBills);
      
      // Calculate stats
      const unpaidBills = userBills.filter(bill => bill.status === 'Unpaid');
      const totalUnits = userBills.reduce((sum, bill) => sum + bill.units, 0);
      const totalDue = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
      
      setStats({
        totalBills: userBills.length,
        unpaidBills: unpaidBills.length,
        totalUnits,
        totalDue,
      });
    }
  }, [currentUser]);

  // Get the most recent bill
  const latestBill = bills.length > 0 
    ? bills.sort((a, b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime())[0]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/generate-bill"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FilePlus size={18} className="mr-2" />
          Generate New Bill
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Bills"
          value={stats.totalBills.toString()}
          icon={<FileText size={24} className="text-blue-600" />}
          color="bg-blue-50"
        />
        <DashboardCard
          title="Unpaid Bills"
          value={stats.unpaidBills.toString()}
          icon={<AlertTriangle size={24} className="text-amber-600" />}
          color="bg-amber-50"
        />
        <DashboardCard
          title="Total Units"
          value={stats.totalUnits.toString()}
          icon={<Zap size={24} className="text-indigo-600" />}
          color="bg-indigo-50"
        />
        <DashboardCard
          title="Total Due"
          value={formatCurrency(stats.totalDue)}
          icon={<span className="text-teal-600 font-medium">₹</span>}
          color="bg-teal-50"
        />
      </div>
      
      {latestBill ? (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-blue-600">
            <h3 className="text-lg font-medium text-white">Latest Bill</h3>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Bill ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{latestBill.id.substring(0, 8)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Units Consumed</dt>
                <dd className="mt-1 text-sm text-gray-900">{latestBill.units} units</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatCurrency(latestBill.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(latestBill.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    latestBill.status === 'Paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {latestBill.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Generated On</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(latestBill.generatedDate)}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <Link
                to="/bill-history"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                View all bills <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <FilePlus size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No bills yet</h3>
            <p className="mt-1 text-sm text-gray-500">Generate your first bill to see it here</p>
            <Link
              to="/generate-bill"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate Bill
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;