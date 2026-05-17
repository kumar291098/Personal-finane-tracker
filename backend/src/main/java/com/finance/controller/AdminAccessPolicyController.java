package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.model.AccessPolicy;
import com.finance.service.AccessPolicyService;
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

@RestController
@RequestMapping("/api/admin/access-policies")
public class AdminAccessPolicyController {

    @Autowired
    private AccessPolicyService accessPolicyService;

    @GetMapping
    public Map<String, Object> listPolicies() {
        List<Map<String, Object>> policies = accessPolicyService.getAllPolicies().stream()
            .sorted(Comparator.comparing(policy -> policy.getAccessLevel().name()))
            .map(this::toResponse)
            .toList();

        return Map.of(
            "pages", accessPolicyService.getAllPages(),
            "policies", policies
        );
    }

    @PatchMapping("/{accessLevel}")
    public ResponseEntity<?> updatePolicy(
            @PathVariable String accessLevel,
            @RequestBody Map<String, List<String>> data) {
        AccessLevel level;
        try {
            level = AccessLevel.valueOf(accessLevel.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException error) {
            return ResponseEntity.badRequest().body("Access level must be ADMIN, SUBSCRIBER, or FREE.");
        }

        if (level == AccessLevel.ADMIN) {
            return ResponseEntity.badRequest().body("Admin always has full access.");
        }

        List<String> allowedPages = data.getOrDefault("allowedPages", List.of());
        return ResponseEntity.ok(toResponse(accessPolicyService.updatePolicy(level, allowedPages)));
    }

    private Map<String, Object> toResponse(AccessPolicy policy) {
        return Map.of(
            "accessLevel", policy.getAccessLevel().name(),
            "allowedPages", accessPolicyService.getAllowedPages(policy.getAccessLevel())
        );
    }
}
