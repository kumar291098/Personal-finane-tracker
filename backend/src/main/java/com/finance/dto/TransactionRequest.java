package com.finance.dto;

public class TransactionRequest {
        private String description;
        private String type;
        private Double amount;
        private String category;
        private Long categoryId;
        private java.time.LocalDate transactionDate;
        private Long userId;

        // Getters and setters
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

        public java.time.LocalDate getTransactionDate() { return transactionDate; }
        public void setTransactionDate(java.time.LocalDate transactionDate) { this.transactionDate = transactionDate; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
    
}