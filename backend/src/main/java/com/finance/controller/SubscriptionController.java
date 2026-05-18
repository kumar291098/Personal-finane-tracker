package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.model.SubscriptionPayment;
import com.finance.model.SubscriptionSettings;
import com.finance.model.User;
import com.finance.repository.SubscriptionPaymentRepository;
import com.finance.repository.UserRepository;
import com.finance.service.AccessPolicyService;
import com.finance.service.DemoSubscriptionReferenceService;
import com.finance.service.RazorpayService;
import com.finance.service.SubscriptionSettingsService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/subscription")
public class SubscriptionController {

    private static final String CURRENCY = "INR";

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private SubscriptionPaymentRepository subscriptionPaymentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccessPolicyService accessPolicyService;

    @Autowired
    private SubscriptionSettingsService subscriptionSettingsService;

    @Autowired
    private DemoSubscriptionReferenceService demoSubscriptionReferenceService;

    @GetMapping("/plan")
    public Map<String, Object> getPlan(HttpServletRequest request) {
        String accessLevel = (String) request.getAttribute("accessLevel");
        SubscriptionSettings settings = subscriptionSettingsService.getSettings();
        return Map.of(
            "name", "Subscriber",
            "amountPaise", settings.getAmountPaise(),
            "currency", CURRENCY,
            "currentAccessLevel", accessLevel == null ? AccessLevel.FREE.name() : accessLevel,
            "paymentConfigured", razorpayService.isConfigured(),
            "manualUpiEnabled", isManualUpiConfigured(settings),
            "upiId", settings.getUpiId() == null ? "" : settings.getUpiId(),
            "upiQrImageUrl", settings.getUpiQrImageUrl() == null ? "" : settings.getUpiQrImageUrl()
        );
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(HttpServletRequest request) {
        if (!razorpayService.isConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Payment gateway is not configured. Add Razorpay keys in backend environment.");
        }

        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");
        }

        Optional<User> userResult = userRepository.findById(userId);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User account not found.");
        }

        User user = userResult.get();
        if (user.getAccessLevel() == AccessLevel.ADMIN || user.getAccessLevel() == AccessLevel.SUBSCRIBER) {
            return ResponseEntity.badRequest().body("This account already has advanced access.");
        }

        SubscriptionSettings settings = subscriptionSettingsService.getSettings();
        Map order = razorpayService.createOrder(
            settings.getAmountPaise(),
            CURRENCY,
            "subscriber_user_" + userId + "_" + System.currentTimeMillis()
        );

        String orderId = String.valueOf(order.get("id"));
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setUserId(userId);
        payment.setOrderId(orderId);
        payment.setAmountPaise(settings.getAmountPaise());
        payment.setCurrency(CURRENCY);
        subscriptionPaymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
            "orderId", orderId,
            "keyId", razorpayService.getKeyId(),
            "amountPaise", settings.getAmountPaise(),
            "currency", CURRENCY,
            "name", "FinanceTracker Subscriber",
            "description", "Advanced finance access"
        ));
    }

    @PostMapping("/manual-requests")
    public ResponseEntity<?> createManualUpiRequest(
            @RequestBody Map<String, String> data,
            HttpServletRequest request) {
        SubscriptionSettings settings = subscriptionSettingsService.getSettings();
        if (!isManualUpiConfigured(settings)) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Manual UPI payment is not configured.");
        }

        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");
        }

        Optional<User> userResult = userRepository.findById(userId);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User account not found.");
        }

        User user = userResult.get();
        if (user.getAccessLevel() == AccessLevel.ADMIN || user.getAccessLevel() == AccessLevel.SUBSCRIBER) {
            return ResponseEntity.badRequest().body("This account already has advanced access.");
        }

        String reference = data.get("reference");
        if (reference == null || reference.trim().length() < 6) {
            return ResponseEntity.badRequest().body("Enter the UPI transaction ID or UTR after payment.");
        }

        if (demoSubscriptionReferenceService.consumeReference(reference)) {
            SubscriptionPayment payment = new SubscriptionPayment();
            payment.setUserId(userId);
            payment.setOrderId("DEMO_" + userId + "_" + System.currentTimeMillis());
            payment.setPaymentId(reference.trim().toUpperCase());
            payment.setAmountPaise(settings.getAmountPaise());
            payment.setCurrency(CURRENCY);
            payment.setStatus("DEMO_APPROVED");
            subscriptionPaymentRepository.save(payment);

            user.setAccessLevel(AccessLevel.SUBSCRIBER);
            user.setSubscriberUntil(LocalDateTime.now().plusMonths(1));
            userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demo subscription activated for one month.",
                "accessLevel", user.getAccessLevel().name(),
                "allowedPages", accessPolicyService.getAllowedPages(user.getAccessLevel()),
                "subscriberUntil", user.getSubscriberUntil().toString()
            ));
        }

        String message = demoSubscriptionReferenceService.isDemoReference(reference)
            ? "Invalid or expired demo UTR. Generate a fresh demo UTR and try again."
            : "Enter a valid demo UTR to activate automatically. This reference was not sent for admin review.";
        return ResponseEntity.badRequest().body(message);
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, String> data,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");
        }

        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");

        if (!razorpayService.isValidSignature(orderId, paymentId, signature)) {
            return ResponseEntity.badRequest().body("Payment verification failed.");
        }

        Optional<SubscriptionPayment> paymentResult = subscriptionPaymentRepository.findByOrderId(orderId);
        if (paymentResult.isEmpty() || !paymentResult.get().getUserId().equals(userId)) {
            return ResponseEntity.badRequest().body("Payment order does not belong to this account.");
        }

        SubscriptionPayment payment = paymentResult.get();
        payment.setPaymentId(paymentId);
        payment.setStatus("PAID");
        subscriptionPaymentRepository.save(payment);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalStateException("User account not found."));
        user.setAccessLevel(AccessLevel.SUBSCRIBER);
        user.setSubscriberUntil(LocalDateTime.now().plusMonths(1));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription activated for one month.",
            "accessLevel", user.getAccessLevel().name(),
            "allowedPages", accessPolicyService.getAllowedPages(user.getAccessLevel()),
            "subscriberUntil", user.getSubscriberUntil().toString()
        ));
    }

    private boolean isManualUpiConfigured(SubscriptionSettings settings) {
        return (settings.getUpiId() != null && !settings.getUpiId().isBlank())
            || (settings.getUpiQrImageUrl() != null && !settings.getUpiQrImageUrl().isBlank());
    }
}
