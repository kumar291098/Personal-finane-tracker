package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.model.SubscriptionPayment;
import com.finance.model.User;
import com.finance.repository.SubscriptionPaymentRepository;
import com.finance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SubscriptionPaymentRepository subscriptionPaymentRepository;

    @GetMapping
    public List<Map<String, Object>> listUsers() {
        return userRepository.findAll().stream()
            .sorted(Comparator.comparing(User::getId))
            .map(this::toUserAccessResponse)
            .toList();
    }

    @GetMapping("/subscription-requests")
    public List<Map<String, Object>> listSubscriptionRequests() {
        return subscriptionPaymentRepository.findAll().stream()
            .filter(payment -> "PENDING_REVIEW".equals(payment.getStatus()))
            .sorted(Comparator.comparing(SubscriptionPayment::getId).reversed())
            .map(this::toSubscriptionRequestResponse)
            .toList();
    }

    @PatchMapping("/subscription-requests/{paymentId}/approve")
    public ResponseEntity<?> approveSubscriptionRequest(@PathVariable Long paymentId) {
        Optional<SubscriptionPayment> paymentResult = subscriptionPaymentRepository.findById(paymentId);
        if (paymentResult.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        SubscriptionPayment payment = paymentResult.get();
        Optional<User> userResult = userRepository.findById(payment.getUserId());
        if (userResult.isEmpty()) {
            return ResponseEntity.badRequest().body("User account not found.");
        }

        User user = userResult.get();
        user.setAccessLevel(AccessLevel.SUBSCRIBER);
        userRepository.save(user);

        payment.setStatus("APPROVED");
        subscriptionPaymentRepository.save(payment);

        return ResponseEntity.ok(toSubscriptionRequestResponse(payment));
    }

    @PatchMapping("/subscription-requests/{paymentId}/reject")
    public ResponseEntity<?> rejectSubscriptionRequest(@PathVariable Long paymentId) {
        return subscriptionPaymentRepository.findById(paymentId)
            .map(payment -> {
                payment.setStatus("REJECTED");
                subscriptionPaymentRepository.save(payment);
                return ResponseEntity.ok(toSubscriptionRequestResponse(payment));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{userId}/access")
    public ResponseEntity<?> updateUserAccess(
            @PathVariable Long userId,
            @RequestBody Map<String, String> data) {
        String accessLevelValue = data.get("accessLevel");
        if (accessLevelValue == null || accessLevelValue.isBlank()) {
            return ResponseEntity.badRequest().body("Choose an access level.");
        }

        AccessLevel accessLevel;
        try {
            accessLevel = AccessLevel.valueOf(accessLevelValue.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body("Access level must be ADMIN, SUBSCRIBER, or FREE.");
        }

        return userRepository.findById(userId)
            .map(user -> {
                if ("demo".equalsIgnoreCase(user.getUsername()) && accessLevel != AccessLevel.ADMIN) {
                    return ResponseEntity.badRequest().body("The demo admin account must stay ADMIN.");
                }
                user.setAccessLevel(accessLevel);
                userRepository.save(user);
                return ResponseEntity.ok(toUserAccessResponse(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Map<String, Object> toUserAccessResponse(User user) {
        return Map.of(
            "id", user.getId(),
            "username", user.getUsername(),
            "email", user.getEmail() == null ? "" : user.getEmail(),
            "phone", user.getPhone() == null ? "" : user.getPhone(),
            "accessLevel", user.getAccessLevel().name(),
            "createdAt", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString(),
            "updatedAt", user.getUpdatedAt() == null ? "" : user.getUpdatedAt().toString()
        );
    }

    private Map<String, Object> toSubscriptionRequestResponse(SubscriptionPayment payment) {
        User user = userRepository.findById(payment.getUserId()).orElse(null);
        return Map.of(
            "id", payment.getId(),
            "userId", payment.getUserId(),
            "username", user == null ? "Unknown" : user.getUsername(),
            "email", user == null || user.getEmail() == null ? "" : user.getEmail(),
            "reference", payment.getPaymentId() == null ? "" : payment.getPaymentId(),
            "amountPaise", payment.getAmountPaise(),
            "currency", payment.getCurrency(),
            "status", payment.getStatus(),
            "createdAt", payment.getCreatedAt() == null ? "" : payment.getCreatedAt().toString()
        );
    }
}
