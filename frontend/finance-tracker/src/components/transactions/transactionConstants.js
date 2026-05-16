export const DEFAULT_FILTERS = {
  type: 'ALL',
  category: 'ALL',
  dateRange: 'ALL',
  search: ''
};

export const DEFAULT_PAYMENT_DATA = {
  app: 'Paytm',
  amount: '',
  category: 'Food & Dining',
  description: ''
};

export const paymentApps = [
  { id: 'Paytm', label: 'Paytm', tone: 'paytm' },
  { id: 'PhonePe', label: 'PhonePe', tone: 'phonepe' },
  { id: 'Google Pay', label: 'GPay', tone: 'gpay' },
  { id: 'UPI', label: 'UPI', tone: 'upi' }
];

export const paymentCategories = [
  { id: 2, name: 'Food & Dining' },
  { id: 3, name: 'Transportation' },
  { id: 4, name: 'Shopping' },
  { id: 5, name: 'Entertainment' },
  { id: 6, name: 'Utilities' },
  { id: 11, name: 'Healthcare' },
  { id: 12, name: 'Education' },
  { id: 13, name: 'Travel' },
  { id: 15, name: 'Donation' },
  { id: 14, name: 'Other Expense' }
];
