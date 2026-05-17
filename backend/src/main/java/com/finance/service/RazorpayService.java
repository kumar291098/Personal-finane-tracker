package com.finance.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

@Service
public class RazorpayService {

    private final RestClient restClient;

    @Value("${razorpay.key.id:}")
    private String keyId;

    @Value("${razorpay.key.secret:}")
    private String keySecret;

    public RazorpayService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
            .baseUrl("https://api.razorpay.com/v1")
            .build();
    }

    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank()
            && keySecret != null && !keySecret.isBlank();
    }

    public String getKeyId() {
        return keyId;
    }

    public Map createOrder(int amountPaise, String currency, String receipt) {
        Map<String, Object> body = Map.of(
            "amount", amountPaise,
            "currency", currency,
            "receipt", receipt
        );

        return restClient.post()
            .uri("/orders")
            .header("Authorization", "Basic " + encodedCredentials())
            .contentType(MediaType.APPLICATION_JSON)
            .body(body)
            .retrieve()
            .body(Map.class);
    }

    public boolean isValidSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null || !isConfigured()) {
            return false;
        }

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(digest);
            return expectedSignature.equals(signature);
        } catch (Exception error) {
            return false;
        }
    }

    private String encodedCredentials() {
        return Base64.getEncoder()
            .encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
    }
}
