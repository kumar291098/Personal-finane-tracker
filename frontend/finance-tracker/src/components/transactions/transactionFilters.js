export const getUniqueCategories = (transactions) => {
  return [...new Set(transactions.map(transaction => transaction.category).filter(Boolean))].sort();
};

export const getTransactionStats = (transactions) => {
  const income = transactions
    .filter(transaction => transaction.type === 'INCOME')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  const expenses = transactions
    .filter(transaction => transaction.type === 'EXPENSE')
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  return {
    income,
    expenses,
    balance: income - expenses,
    count: transactions.length
  };
};

export const filterAndSortTransactions = (transactions, filters, sortBy, sortOrder) => {
  const searchText = filters.search.trim().toLowerCase();

  const filtered = transactions.filter(transaction => {
    if (filters.type !== 'ALL' && transaction.type !== filters.type) {
      return false;
    }

    if (filters.category !== 'ALL' && transaction.category !== filters.category) {
      return false;
    }

    if (searchText) {
      const description = transaction.description?.toLowerCase() || '';
      const category = transaction.category?.toLowerCase() || '';
      if (!description.includes(searchText) && !category.includes(searchText)) {
        return false;
      }
    }

    if (filters.dateRange !== 'ALL') {
      const startDate = getStartDate(filters.dateRange);
      return new Date(transaction.transactionDate) >= startDate;
    }

    return true;
  });

  return filtered.sort((first, second) => {
    const firstValue = getSortValue(first, sortBy);
    const secondValue = getSortValue(second, sortBy);

    if (firstValue === secondValue) {
      return 0;
    }

    const result = firstValue > secondValue ? 1 : -1;
    return sortOrder === 'asc' ? result : -result;
  });
};

const getStartDate = (dateRange) => {
  const now = new Date();
  const startDate = new Date();

  switch (dateRange) {
    case 'TODAY':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'WEEK':
      startDate.setDate(now.getDate() - 7);
      break;
    case 'MONTH':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case 'YEAR':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      break;
  }

  return startDate;
};

const getSortValue = (transaction, sortBy) => {
  switch (sortBy) {
    case 'amount':
      return Number(transaction.amount || 0);
    case 'category':
      return transaction.category || '';
    case 'description':
      return transaction.description || '';
    default:
      return new Date(transaction.transactionDate);
  }
};
