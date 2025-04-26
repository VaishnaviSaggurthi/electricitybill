import { User, Bill } from '../types';

// Initialize default data if not exists
const initializeDefaultData = () => {
  const users = localStorage.getItem('users');
  if (!users) {
    const defaultUser: User = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      address: '123 Main St, City',
      meterNo: 'MET123456',
      phone: '1234567890'
    };
    localStorage.setItem('users', JSON.stringify([defaultUser]));

    // Generate bills for the last 6 months
    const bills: Bill[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const billDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const dueDate = new Date(billDate);
      dueDate.setDate(billDate.getDate() + 15); // Due date is 15 days from generation
      
      const units = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
      const amount = units * UNIT_RATE;
      const tax = amount * TAX_RATE;
      const totalAmount = amount + tax;
      
      bills.push({
        id: `BILL${billDate.getTime()}`,
        userId: '1',
        units,
        amount,
        tax,
        totalAmount,
        status: i > 0 ? 'Paid' : 'Unpaid',
        generatedDate: billDate.toISOString(),
        dueDate: dueDate.toISOString(),
        paidDate: i > 0 ? new Date(billDate.getFullYear(), billDate.getMonth(), 10).toISOString() : undefined
      });
    }
    
    localStorage.setItem('bills', JSON.stringify(bills));
  }
};

// Initialize data when the module loads
initializeDefaultData();

// User-related storage functions
export const getStoredUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUserByIdentifier = (identifier: string): User | null => {
  const users = getStoredUsers();
  return users.find(u => u.email === identifier || u.meterNo === identifier) || null;
};

export const storeUser = (user: User): void => {
  const users = getStoredUsers();
  const existingUserIndex = users.findIndex(u => u.id === user.id);
  
  if (existingUserIndex >= 0) {
    users[existingUserIndex] = user;
  } else {
    users.push(user);
  }
  
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const clearCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};

// Bill-related storage functions
export const getStoredBills = (): Bill[] => {
  const bills = localStorage.getItem('bills');
  return bills ? JSON.parse(bills) : [];
};

export const getBillsByUserId = (userId: string): Bill[] => {
  const bills = getStoredBills();
  return bills.filter(bill => bill.userId === userId);
};

export const storeBill = (bill: Bill): void => {
  const bills = getStoredBills();
  bills.push(bill);
  localStorage.setItem('bills', JSON.stringify(bills));
};

export const getMonthlyBill = (userId: string, month: number, year: number): Bill | null => {
  const bills = getBillsByUserId(userId);
  return bills.find(bill => {
    const billDate = new Date(bill.generatedDate);
    return billDate.getMonth() === month && billDate.getFullYear() === year;
  }) || null;
};

export const generateMonthlyBills = () => {
  const users = getStoredUsers();
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  users.forEach(user => {
    // Check if bill already exists for current month
    const existingBill = getMonthlyBill(user.id, currentMonth, currentYear);
    if (!existingBill) {
      const units = Math.floor(Math.random() * (500 - 200 + 1)) + 200;
      const amount = units * UNIT_RATE;
      const tax = amount * TAX_RATE;
      const totalAmount = amount + tax;
      
      const dueDate = new Date(currentDate);
      dueDate.setDate(currentDate.getDate() + 15);
      
      const bill: Bill = {
        id: `BILL${Date.now()}`,
        userId: user.id,
        units,
        amount,
        tax,
        totalAmount,
        status: 'Unpaid',
        generatedDate: currentDate.toISOString(),
        dueDate: dueDate.toISOString(),
      };
      
      storeBill(bill);
    }
  });
};

// Constants
export const UNIT_RATE = 5; // ₹5 per unit
export const TAX_RATE = 0.18; // 18% GST