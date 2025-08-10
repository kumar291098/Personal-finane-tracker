package com.finance.controller;

import com.finance.model.Transaction;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import com.finance.model.User;
import com.finance.dto.TransactionRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Transaction>> getAllTransactions(@PathVariable Long userId, HttpServletRequest request) {
        // Verify the authenticated user matches the requested userId
        Long authenticatedUserId = (Long) request.getAttribute("userId");
        if (authenticatedUserId == null || !authenticatedUserId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        List<Transaction> transactions = transactionRepository.findByUserId(userId);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping("/add")
    public ResponseEntity<?> addTransaction(@RequestBody TransactionRequest request, HttpServletRequest httpRequest) {
        try {
            System.out.println("🏦 TransactionController - addTransaction called");
            
            // Get authenticated user info from JWT filter
            Long authenticatedUserId = (Long) httpRequest.getAttribute("userId");
            String authenticatedUsername = (String) httpRequest.getAttribute("username");
            
            System.out.println("🆔 Authenticated User ID: " + authenticatedUserId);
            System.out.println("👤 Authenticated Username: " + authenticatedUsername);
            System.out.println("📝 Request User ID: " + request.getUserId());
            
            if (authenticatedUserId == null) {
                System.out.println("❌ No authenticated user ID found");
                return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
            }
            
            // Verify the request userId matches the authenticated user
            if (request.getUserId() != null && !request.getUserId().equals(authenticatedUserId)) {
                System.out.println("❌ User ID mismatch - Request: " + request.getUserId() + ", Authenticated: " + authenticatedUserId);
                return ResponseEntity.status(403).body("{\"error\":\"Cannot create transaction for another user\"}");
            }
            
            // Use authenticated user ID if not provided in request
            Long userId = request.getUserId() != null ? request.getUserId() : authenticatedUserId;
            System.out.println("✅ Using User ID: " + userId);
            
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                System.out.println("❌ User not found with ID: " + userId);
                return ResponseEntity.status(400).body("{\"error\":\"User not found with ID: " + userId + "\"}");
            }

            User user = userOptional.get();
            System.out.println("✅ User found: " + user.getUsername());

            Transaction transaction = new Transaction();
            transaction.setDescription(request.getDescription());
            transaction.setType(request.getType());
            transaction.setAmount(request.getAmount());
            transaction.setTransactionDate(request.getTransactionDate());
            transaction.setCategory(request.getCategory());
            transaction.setCategoryId(request.getCategoryId());
            transaction.setCreatedAt(LocalDateTime.now());
            transaction.setUpdatedAt(LocalDateTime.now());
            transaction.setUser(user);

            System.out.println("💾 Saving transaction: " + request.getDescription() + " - " + request.getAmount());
            Transaction savedTransaction = transactionRepository.save(transaction);
            System.out.println("✅ Transaction saved successfully with ID: " + savedTransaction.getId());
            
            return ResponseEntity.ok(savedTransaction);
            
        } catch (Exception e) {
            System.out.println("❌ Error in addTransaction: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"Failed to create transaction: " + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/update/{id}")
    public Transaction updateTransaction(@PathVariable Long id, @RequestBody TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));

        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());
        transaction.setAmount(request.getAmount());
        transaction.setCategory(request.getCategory());
        transaction.setCategoryId(request.getCategoryId());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setUpdatedAt(LocalDateTime.now());

        // Optional: update user if userId provided
        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            transaction.setUser(user);
        }

        return transactionRepository.save(transaction);
    }

    @DeleteMapping("/delete/{id}")
    public String deleteTransaction(@PathVariable Long id, @RequestParam Long userId) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found with ID: " + id));

        // Check if the transaction belongs to the user
        User transactionUser = transaction.getUser();
        if (transactionUser == null || !transactionUser.getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own transactions");
        }

        transactionRepository.delete(transaction);
        return "Transaction deleted successfully";
    }

}
