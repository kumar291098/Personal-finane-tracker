import { API_BASE_URL } from '../config/api';
import { transactionService } from './transactionService';
import { formatCurrency, formatDate } from '../utils/transactionUtils';

const MAX_LIST_ITEMS = 10;

const categoryAliases = [
  { category: 'Food & Dining', terms: ['food', 'dining', 'restaurant', 'lunch', 'dinner', 'breakfast', 'meal'] },
  { category: 'Transportation', terms: ['transport', 'transportation', 'taxi', 'cab', 'fuel', 'petrol'] },
  { category: 'Travel', terms: ['travel', 'trip', 'flight', 'hotel'] },
  { category: 'Shopping', terms: ['shopping', 'shop', 'clothes', 'clothing', 'purchase'] },
  { category: 'Salary', terms: ['salary', 'paycheck', 'pay cheque', 'wage'] },
  { category: 'Entertainment', terms: ['entertainment', 'movie', 'cinema', 'netflix'] },
  { category: 'Utilities', terms: ['utilities', 'utility', 'electricity', 'water', 'internet', 'wifi', 'bill'] },
  { category: 'Healthcare', terms: ['health', 'healthcare', 'doctor', 'medicine', 'medical'] },
  { category: 'Education', terms: ['education', 'course', 'book', 'tuition', 'class'] },
  { category: 'Donation', terms: ['donation', 'charity'] },
  { category: 'Freelance', terms: ['freelance', 'client'] },
  { category: 'Investment', terms: ['investment', 'invest', 'stock', 'mutual fund'] }
];

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Please log in again before using the assistant.');
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const aiService = {
  sendMessage: async (message, conversation = []) => {
    const transactionReply = await getSmartFinanceReply(message, conversation);
    if (transactionReply) {
      return { reply: transactionReply };
    }

    return sendToAiEndpoint(message);
  }
};

const getSmartFinanceReply = async (message, conversation) => {
  const normalizedMessage = normalizeMessage(message);
  const transactions = await transactionService.getUserTransactions();
  const intent = understandFinanceIntent(normalizedMessage, transactions, conversation);

  if (!intent.isFinanceQuestion) {
    return null;
  }

  const scopedTransactions = applyIntentFilters(transactions, intent);

  if (intent.kind === 'biggest') {
    return formatBiggestExpense(scopedTransactions, intent);
  }

  if (intent.kind === 'summary') {
    return formatSummary(scopedTransactions, intent);
  }

  if (intent.kind === 'total') {
    return formatTotal(scopedTransactions, intent);
  }

  return formatTransactionList(scopedTransactions, intent);
};

const normalizeMessage = (message) => {
  return message
    .toLowerCase()
    .replace(/\bexpanse\b/g, 'expense')
    .replace(/\bexpanses\b/g, 'expenses')
    .replace(/\btransation\b/g, 'transaction')
    .replace(/\btransations\b/g, 'transactions')
    .replace(/\btrasaction\b/g, 'transaction')
    .replace(/\s+/g, ' ')
    .trim();
};

const understandFinanceIntent = (message, transactions, conversation) => {
  const explicitCategory = findCategory(message, transactions);
  const category = explicitCategory || (shouldUsePreviousContext(message) ? findCategoryFromConversation(conversation, transactions) : null);
  const descriptionText = explicitCategory ? null : findDescriptionMatch(message, transactions);
  const type = findType(message);
  const timeRange = findTimeRange(message);
  const count = findCount(message);
  const kind = findAnswerKind(message);

  const financeWords = [
    'transaction',
    'expense',
    'income',
    'spend',
    'spent',
    'payment',
    'budget',
    'saving',
    'balance',
    'money',
    'cost',
    'total',
    'recent',
    'latest',
    'last',
    'today',
    'yesterday',
    'week',
    'month'
  ];

  const isFinanceQuestion = Boolean(
    category
    || descriptionText
    || type
    || timeRange
    || financeWords.some(word => message.includes(word))
  );

  return {
    isFinanceQuestion,
    kind,
    category,
    descriptionText,
    type,
    timeRange,
    count: count || getDefaultCount(message)
  };
};

const shouldUsePreviousContext = (message) => {
  if (message.includes('all transaction') || message.includes('all transactions')) {
    return false;
  }

  if (findTimeRange(message)) {
    return false;
  }

  return [
    'what about',
    'and ',
    'same',
    'that',
    'those',
    'there',
    'again',
    'for it',
    'for them'
  ].some(phrase => message.includes(phrase));
};

const getDefaultCount = (message) => {
  if (!message.includes('last') && !message.includes('recent') && !message.includes('latest')) {
    return null;
  }

  if (/\blast\s+transactions?\b/.test(message) || /\blatest\s+transactions?\b/.test(message)) {
    return message.includes('transactions') ? 5 : 1;
  }

  return 5;
};

const findAnswerKind = (message) => {
  if (message.includes('biggest') || message.includes('highest') || message.includes('largest') || message.includes('maximum')) {
    return 'biggest';
  }

  if (
    message.includes('how much')
    || message.includes('total')
    || message.includes('sum')
    || message.includes('spent on')
    || message.includes('expense on')
  ) {
    return 'total';
  }

  if (
    message.includes('summary')
    || message.includes('overview')
    || message.includes('balance')
    || message.includes('budget')
    || message.includes('saving')
    || message.includes('insight')
  ) {
    return 'summary';
  }

  return 'list';
};

const findType = (message) => {
  if (message.includes('income') || message.includes('earning') || message.includes('salary')) {
    return 'INCOME';
  }

  if (message.includes('expense') || message.includes('spend') || message.includes('spent') || message.includes('payment') || message.includes('cost')) {
    return 'EXPENSE';
  }

  return null;
};

const findCategory = (message, transactions) => {
  const knownCategories = [...new Set(transactions.map(transaction => transaction.category).filter(Boolean))];

  const directCategory = knownCategories.find(category => {
    return message.includes(category.toLowerCase());
  });

  if (directCategory) {
    return directCategory;
  }

  const matchedAlias = categoryAliases.find(alias => {
    return alias.terms.some(term => message.includes(term));
  });

  return matchedAlias?.category || null;
};

const findCategoryFromConversation = (conversation, transactions) => {
  const recentUserMessages = conversation
    .filter(item => item.role === 'user')
    .slice(-3)
    .map(item => normalizeMessage(item.content || ''))
    .reverse();

  for (const previousMessage of recentUserMessages) {
    const category = findCategory(previousMessage, transactions);
    if (category) {
      return category;
    }
  }

  return null;
};

const findDescriptionMatch = (message, transactions) => {
  const words = message.split(' ').filter(word => word.length >= 3);
  const ignoredWords = new Set([
    'give',
    'show',
    'find',
    'list',
    'last',
    'latest',
    'recent',
    'transaction',
    'transactions',
    'expense',
    'expenses',
    'income',
    'today',
    'week',
    'month',
    'total',
    'much'
  ]);

  const usefulWords = words.filter(word => !ignoredWords.has(word));
  if (!usefulWords.length) {
    return null;
  }

  return usefulWords.find(word => {
    return transactions.some(transaction => {
      return transaction.description?.toLowerCase().includes(word);
    });
  }) || null;
};

const findTimeRange = (message) => {
  const now = new Date();
  const today = getDateOnly(now);
  const specificDate = findSpecificDate(message, today.getFullYear());

  if (specificDate) {
    return {
      label: specificDate.label,
      start: specificDate.date,
      end: specificDate.date
    };
  }

  if (message.includes('today')) {
    return { label: 'today', start: today, end: today };
  }

  if (message.includes('yesterday')) {
    const yesterday = shiftDate(today, -1);
    return { label: 'yesterday', start: yesterday, end: yesterday };
  }

  const daysMatch = message.match(/(?:last|past|previous)\s+(\d{1,2})\s+days?/);
  if (daysMatch) {
    const days = Math.max(1, Math.min(Number(daysMatch[1]), 30));
    return { label: `last ${days} days`, start: shiftDate(today, -days), end: today };
  }

  if (message.includes('last week') || message.includes('past week') || message.includes('previous week')) {
    return { label: 'last 7 days', start: shiftDate(today, -7), end: today };
  }

  if (message.includes('this week')) {
    return { label: 'this week', start: shiftDate(today, -today.getDay()), end: today };
  }

  if (message.includes('last month') || message.includes('past month') || message.includes('previous month')) {
    const start = new Date(today);
    start.setMonth(start.getMonth() - 1);
    return { label: 'last month', start, end: today };
  }

  if (message.includes('this month')) {
    return { label: 'this month', start: new Date(today.getFullYear(), today.getMonth(), 1), end: today };
  }

  return null;
};

const findSpecificDate = (message, fallbackYear) => {
  const monthNames = {
    jan: 0,
    january: 0,
    feb: 1,
    february: 1,
    mar: 2,
    march: 2,
    apr: 3,
    april: 3,
    may: 4,
    jun: 5,
    june: 5,
    jul: 6,
    july: 6,
    aug: 7,
    august: 7,
    sep: 8,
    sept: 8,
    september: 8,
    oct: 9,
    october: 9,
    nov: 10,
    november: 10,
    dec: 11,
    december: 11
  };

  const dayMonthMatch = message.match(/\b(\d{1,2})\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+(\d{4}))?\b/);
  if (dayMonthMatch) {
    const day = Number(dayMonthMatch[1]);
    const monthName = dayMonthMatch[2];
    const year = Number(dayMonthMatch[3] || fallbackYear);
    return {
      label: `${day} ${monthName} ${year}`,
      date: new Date(year, monthNames[monthName], day)
    };
  }

  const monthDayMatch = message.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:\s+(\d{4}))?\b/);
  if (monthDayMatch) {
    const monthName = monthDayMatch[1];
    const day = Number(monthDayMatch[2]);
    const year = Number(monthDayMatch[3] || fallbackYear);
    return {
      label: `${day} ${monthName} ${year}`,
      date: new Date(year, monthNames[monthName], day)
    };
  }

  return null;
};

const findCount = (message) => {
  const numberWords = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10
  };

  const digitMatch = message.match(/\b(\d{1,2})\b/);
  if (digitMatch) {
    return Math.max(1, Math.min(Number(digitMatch[1]), MAX_LIST_ITEMS));
  }

  const wordMatch = Object.entries(numberWords).find(([word]) => message.includes(word));
  return wordMatch ? wordMatch[1] : null;
};

const applyIntentFilters = (transactions, intent) => {
  let result = [...transactions];

  if (intent.type) {
    result = result.filter(transaction => transaction.type === intent.type);
  }

  if (intent.category) {
    result = result.filter(transaction => transaction.category === intent.category);
  }

  if (intent.descriptionText) {
    result = result.filter(transaction => {
      return transaction.description?.toLowerCase().includes(intent.descriptionText);
    });
  }

  if (intent.timeRange) {
    result = result.filter(transaction => {
      const transactionDate = parseTransactionDate(transaction.transactionDate);
      return transactionDate >= intent.timeRange.start && transactionDate <= intent.timeRange.end;
    });
  }

  result.sort((first, second) => {
    const dateDifference = parseTransactionDate(second.transactionDate) - parseTransactionDate(first.transactionDate);
    return dateDifference || Number(second.id || 0) - Number(first.id || 0);
  });

  if (intent.kind === 'list' && intent.count) {
    return result.slice(0, intent.count);
  }

  return result;
};

const formatTransactionList = (transactions, intent) => {
  const title = buildTitle(intent);

  if (!transactions.length) {
    return `${title}: I could not find matching transactions. Try asking for a wider range, like "last month food expenses".`;
  }

  const shownTransactions = transactions.slice(0, intent.count || MAX_LIST_ITEMS);
  const hiddenCount = Math.max(0, transactions.length - shownTransactions.length);
  const lines = shownTransactions.map(formatTransactionLine);
  const moreText = hiddenCount ? `\n\nThere are ${hiddenCount} more matching transactions.` : '';

  return `${title}:\n${lines.join('\n')}${moreText}`;
};

const formatTotal = (transactions, intent) => {
  const title = buildTitle(intent);

  if (!transactions.length) {
    return `${title}: I could not find matching transactions to total.`;
  }

  const income = sumByType(transactions, 'INCOME');
  const expenses = sumByType(transactions, 'EXPENSE');

  if (intent.type === 'INCOME') {
    return `${title}: total income is ${formatCurrency(income)} across ${transactions.length} transaction${plural(transactions.length)}.`;
  }

  if (intent.type === 'EXPENSE' || expenses > 0) {
    return `${title}: total expense is ${formatCurrency(expenses)} across ${transactions.length} transaction${plural(transactions.length)}.`;
  }

  return `${title}: income ${formatCurrency(income)}, expenses ${formatCurrency(expenses)}, net ${formatCurrency(income - expenses)}.`;
};

const formatSummary = (transactions, intent) => {
  if (!transactions.length) {
    return 'I could not find transactions for that context yet.';
  }

  const income = sumByType(transactions, 'INCOME');
  const expenses = sumByType(transactions, 'EXPENSE');
  const net = income - expenses;
  const topCategory = getTopExpenseCategory(transactions);
  const title = buildTitle(intent);

  return [
    `${title} summary:`,
    `Income: ${formatCurrency(income)}`,
    `Expenses: ${formatCurrency(expenses)}`,
    `Net: ${formatCurrency(net)}`,
    topCategory ? `Top expense area: ${topCategory.category} (${formatCurrency(topCategory.amount)})` : 'Top expense area: no expenses found',
    net >= 0
      ? 'You are positive in this view. Keep an eye on the biggest expense area.'
      : 'Expenses are higher than income in this view. Start by reviewing the biggest flexible category.'
  ].join('\n');
};

const formatBiggestExpense = (transactions, intent) => {
  const expenses = transactions.filter(transaction => transaction.type === 'EXPENSE');
  const biggest = expenses.sort((first, second) => Number(second.amount || 0) - Number(first.amount || 0))[0];

  if (!biggest) {
    return `${buildTitle(intent)}: I could not find an expense in that context.`;
  }

  return `Biggest expense${intent.timeRange ? ` in ${intent.timeRange.label}` : ''}:\n${formatTransactionLine(biggest)}`;
};

const buildTitle = (intent) => {
  const parts = [];

  if (intent.category) parts.push(intent.category);
  if (intent.type) parts.push(intent.type.toLowerCase());
  parts.push('transactions');
  if (intent.timeRange) parts.push(`for ${intent.timeRange.label}`);
  if (!intent.timeRange && intent.count) {
    parts.unshift(intent.count === 1 ? 'Last' : `Last ${intent.count}`);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const formatTransactionLine = (transaction) => {
  const amountPrefix = transaction.type === 'INCOME' ? '+' : '-';
  return [
    formatDate(transaction.transactionDate),
    transaction.type,
    `${amountPrefix}${formatCurrency(Number(transaction.amount || 0))}`,
    transaction.category || 'Uncategorized',
    transaction.description || 'No description'
  ].join(' | ');
};

const sumByType = (transactions, type) => {
  return transactions
    .filter(transaction => transaction.type === type)
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
};

const getTopExpenseCategory = (transactions) => {
  const totals = transactions
    .filter(transaction => transaction.type === 'EXPENSE')
    .reduce((result, transaction) => {
      const category = transaction.category || 'Uncategorized';
      result[category] = (result[category] || 0) + Number(transaction.amount || 0);
      return result;
    }, {});

  const [category, amount] = Object.entries(totals).sort((first, second) => second[1] - first[1])[0] || [];
  return category ? { category, amount } : null;
};

const parseTransactionDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getDateOnly = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const shiftDate = (date, days) => {
  const shiftedDate = new Date(date);
  shiftedDate.setDate(shiftedDate.getDate() + days);
  return shiftedDate;
};

const plural = (count) => {
  return count === 1 ? '' : 's';
};

const sendToAiEndpoint = async (message) => {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = errorText || 'Assistant is unavailable right now.';

    try {
      const parsedError = JSON.parse(errorText);
      errorMessage = parsedError.message || parsedError.error || errorMessage;
    } catch (error) {
      // Keep the raw backend message when it is not JSON.
    }

    if (response.status === 401 || response.status === 403) {
      errorMessage = 'I can answer transaction questions from your current data, but the AI endpoint is not authorized yet. Please log in again or restart the backend for general AI questions.';
    }

    throw new Error(errorMessage);
  }

  return response.json();
};
