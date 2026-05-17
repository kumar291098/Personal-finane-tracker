package com.finance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private final RestClient restClient;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:}")
    private String senderEmail;

    @Value("${brevo.sender.name:FinanceTracker}")
    private String senderName;

    public EmailService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.brevo.com/v3")
                .build();
    }

    public boolean isConfigured() {
        return brevoApiKey != null && !brevoApiKey.isBlank()
                && senderEmail != null && !senderEmail.isBlank();
    }

    public void sendPasswordResetOtp(String recipientEmail, String username, String otp, int expiryMinutes) {
        if (!isConfigured()) {
            throw new IllegalStateException("Brevo email service is not configured.");
        }

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", senderName,
                        "email", senderEmail
                ),
                "to", List.of(Map.of(
                        "email", recipientEmail,
                        "name", username == null || username.isBlank() ? recipientEmail : username
                )),
                "subject", "Your FinanceTracker password reset OTP",
                "htmlContent", buildOtpEmailHtml(username, otp, expiryMinutes),
                "textContent", "Your FinanceTracker password reset OTP is " + otp
                        + ". It expires in " + expiryMinutes + " minutes."
        );

        restClient.post()
                .uri("/smtp/email")
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .toBodilessEntity();
    }

    private String buildOtpEmailHtml(String username, String otp, int expiryMinutes) {
        String displayName = username == null || username.isBlank() ? "there" : username;
        return """
                <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
                  <h2>FinanceTracker password reset</h2>
                  <p>Hi %s,</p>
                  <p>Use this OTP to reset your password:</p>
                  <p style="font-size:28px;font-weight:700;letter-spacing:6px;color:#0f766e">%s</p>
                  <p>This OTP expires in %d minutes.</p>
                  <p>If you did not request this, you can ignore this email.</p>
                </div>
                """.formatted(displayName, otp, expiryMinutes);
    }

}
