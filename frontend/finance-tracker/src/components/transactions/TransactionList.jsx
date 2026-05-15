import React from 'react';

const TransactionList = ({ transactions, onEdit, onDelete }) => {
  return (
    <div className="transactions-list">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id}>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td className={transaction.type ? transaction.type.toLowerCase() : 'expense'}>
                {transaction.type}
              </td>
              <td>₹{transaction.amount ? transaction.amount.toFixed(2) : '0.00'}</td>
              <td>
                {transaction.transactionDate 
                  ? new Date(transaction.transactionDate).toLocaleDateString() 
                  : 'N/A'}
              </td>
              <td>
                <button 
                  className="edit-button" 
                  onClick={() => onEdit(transaction)}
                >
                  Edit
                </button>
                <button 
                  className="delete-button" 
                  onClick={() => onDelete(transaction.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;