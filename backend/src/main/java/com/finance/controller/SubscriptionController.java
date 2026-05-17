package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.model.SubscriptionPayment;
import com.finance.model.User;
import com.finance.repository.SubscriptionPaymentRepository;
import com.finance.repository.UserRepository;
import com.finance.service.AccessPolicyService;
import com.finance.service.RazorpayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Optional;

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

    @Value("${subscription.subscriber.amount-paise:9900}")
    private int subscriberAmountPaise;

    @Value("${subscription.upi.id:}")
    private String upiId;

    @Value("${subscription.upi.qr-image-url:}")
    private String upiQrImageUrl;

    @GetMapping("/plan")
    public Map<String, Object> getPlan(HttpServletRequest request) {
        String accessLevel = (String) request.getAttribute("accessLevel");
        return Map.of(
            "name", "Subscriber",
            "amountPaise", subscriberAmountPaise,
            "currency", CURRENCY,
            "currentAccessLevel", accessLevel == null ? AccessLevel.FREE.name() : accessLevel,
            "paymentConfigured", razorpayService.isConfigured(),
            "manualUpiEnabled", isManualUpiConfigured(),
            "upiId", upiId == null ? "" : upiId,
            "upiQrImageUrl", upiQrImageUrl == null ? "" : upiQrImageUrl
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

        Map order = razorpayService.createOrder(
            subscriberAmountPaise,
            CURRENCY,
            "subscriber_user_" + userId + "_" + System.currentTimeMillis()
        );

        String orderId = String.valueOf(order.get("id"));
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setUserId(userId);
        payment.setOrderId(orderId);
        payment.setAmountPaise(subscriberAmountPaise);
        payment.setCurrency(CURRENCY);
        subscriptionPaymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
            "orderId", orderId,
            "keyId", razorpayService.getKeyId(),
            "amountPaise", subscriberAmountPaise,
            "currency", CURRENCY,
            "name", "FinanceTracker Subscriber",
            "description", "Advanced finance access"
        ));
    }

    @PostMapping("/manual-requests")
    public ResponseEntity<?> createManualUpiRequest(
            @RequestBody Map<String, String> data,
            HttpServletRequest request) {
        if (!isManualUpiConfigured()) {
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

        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setUserId(userId);
        payment.setOrderId("UPI_" + userId + "_" + System.currentTimeMillis());
        payment.setPaymentId(reference.trim());
        payment.setAmountPaise(subscriberAmountPaise);
        payment.setCurrency(CURRENCY);
        payment.setStatus("PENDING_REVIEW");
        subscriptionPaymentRepository.save(payment);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Payment reference submitted. Admin will review and activate subscriber access."
        ));
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
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Subscription activated.",
            "accessLevel", user.getAccessLevel().name(),
            "allowedPages", accessPolicyService.getAllowedPages(user.getAccessLevel())
        ));
    }

    private boolean isManualUpiConfigured() {
        return (upiId != null && !upiId.isBlank()) || (upiQrImageUrl != null && !upiQrImageUrl.isBlank());
    }
}
