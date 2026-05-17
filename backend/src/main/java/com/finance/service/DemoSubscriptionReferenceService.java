package com.finance.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DemoSubscriptionReferenceService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int EXPIRY_MINUTES = 30;

    private final Map<String, LocalDateTime> references = new ConcurrentHashMap<>();

    public Map<String, Object> createReference() {
        String reference = "TEST-SUB-" + String.format("%06d", RANDOM.nextInt(1_000_000));
        references.put(reference, LocalDateTime.now().plusMinutes(EXPIRY_MINUTES));
        return Map.of(
            "reference", reference,
            "expiresInMinutes", EXPIRY_MINUTES
        );
    }

    public boolean consumeReference(String reference) {
        if (reference == null || reference.isBlank()) {
            return false;
        }

        String normalized = reference.trim().toUpperCase();
        LocalDateTime expiresAt = references.remove(normalized);
        return expiresAt != null && LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isDemoReference(String reference) {
        if (reference == null) {
            return false;
        }

        return reference.trim().toUpperCase().startsWith("TEST-SUB-");
    }
}
