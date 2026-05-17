package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.model.SubscriptionSettings;
import com.finance.repository.UserRepository;
import com.finance.service.SubscriptionSettingsService;
import com.finance.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/admin/subscription-settings")
public class PublicAdminSubscriptionSettingsController {

    private static final String DEMO_QR_URL =
        "https://personal-finane-tracker-np61.vercel.app/demo-subscription-qr.png";

    @Autowired
    private SubscriptionSettingsService subscriptionSettingsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> updateSettings(HttpServletRequest request, @RequestBody Map<String, Object> data) {
        ResponseEntity<?> unauthorized = requireAdmin(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        Integer amountPaise;
        try {
            amountPaise = Integer.parseInt(String.valueOf(data.getOrDefault("amountPaise", "0")));
        } catch (NumberFormatException error) {
            return ResponseEntity.badRequest().body("Subscription fee must be a valid amount in paise.");
        }

        if (amountPaise <= 0) {
            return ResponseEntity.badRequest().body("Subscription fee must be greater than zero.");
        }

        SubscriptionSettings settings = subscriptionSettingsService.updateSettings(
            amountPaise,
            String.valueOf(data.getOrDefault("upiId", "")),
            String.valueOf(data.getOrDefault("upiQrImageUrl", ""))
        );

        return ResponseEntity.ok(toSubscriptionSettingsResponse(settings));
    }

    @PostMapping("/qr-data")
    public ResponseEntity<?> uploadQrData(HttpServletRequest request, @RequestBody Map<String, String> data) {
        ResponseEntity<?> unauthorized = requireAdmin(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        String dataUrl = data.getOrDefault("dataUrl", "").trim();
        if (dataUrl.isBlank()) {
            return ResponseEntity.badRequest().body("Choose a QR image to upload.");
        }

        if (!dataUrl.startsWith("data:image/png;base64,")
                && !dataUrl.startsWith("data:image/jpeg;base64,")
                && !dataUrl.startsWith("data:image/webp;base64,")) {
            return ResponseEntity.badRequest().body("Upload a PNG, JPG, or WEBP image.");
        }

        SubscriptionSettings current = subscriptionSettingsService.getSettings();
        SubscriptionSettings updated = subscriptionSettingsService.updateSettings(
            current.getAmountPaise(),
            current.getUpiId(),
            dataUrl
        );

        return ResponseEntity.ok(toSubscriptionSettingsResponse(updated));
    }

    @GetMapping("/demo-qr")
    public ResponseEntity<?> useDemoQr(HttpServletRequest request) {
        ResponseEntity<?> unauthorized = requireAdmin(request);
        if (unauthorized != null) {
            return unauthorized;
        }

        SubscriptionSettings current = subscriptionSettingsService.getSettings();
        SubscriptionSettings updated = subscriptionSettingsService.updateSettings(
            current.getAmountPaise(),
            current.getUpiId(),
            DEMO_QR_URL
        );

        return ResponseEntity.ok(toSubscriptionSettingsResponse(updated));
    }

    private ResponseEntity<?> requireAdmin(HttpServletRequest request) {
        String token = resolveToken(request);
        if (token == null) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "Authentication required",
                "message", "Admin token is required."
            ));
        }

        try {
            String username = jwtUtil.extractUsername(token);
            if (username == null || jwtUtil.isTokenExpired(token) || !jwtUtil.validateToken(token, username)) {
                return forbidden();
            }

            String accessLevel = userRepository.findByUsername(username)
                .map(user -> user.getAccessLevel().name())
                .orElseGet(() -> "demo".equalsIgnoreCase(username)
                    ? AccessLevel.ADMIN.name()
                    : jwtUtil.extractAccessLevel(token));

            if (!AccessLevel.ADMIN.name().equals(accessLevel)) {
                return forbidden();
            }

            return null;
        } catch (Exception error) {
            return forbidden();
        }
    }

    private ResponseEntity<?> forbidden() {
        return ResponseEntity.status(403).body(Map.of(
            "error", "Forbidden",
            "message", "Admin access is required."
        ));
    }

    private String resolveToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        String fallbackHeader = request.getHeader("X-Auth-Token");
        if (fallbackHeader != null && !fallbackHeader.isBlank()) {
            return fallbackHeader.trim();
        }

        String queryToken = request.getParameter("access_token");
        if (queryToken != null && !queryToken.isBlank()) {
            return queryToken.trim();
        }

        return null;
    }

    private Map<String, Object> toSubscriptionSettingsResponse(SubscriptionSettings settings) {
        return Map.of(
            "amountPaise", settings.getAmountPaise(),
            "upiId", settings.getUpiId() == null ? "" : settings.getUpiId(),
            "upiQrImageUrl", settings.getUpiQrImageUrl() == null ? "" : settings.getUpiQrImageUrl(),
            "updatedAt", settings.getUpdatedAt() == null ? "" : settings.getUpdatedAt().toString()
        );
    }
}
