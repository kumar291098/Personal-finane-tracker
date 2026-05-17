package com.finance.controller;

import com.finance.model.AccessLevel;
import com.finance.service.AccessPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/access-policy")
public class AccessPolicyController {

    @Autowired
    private AccessPolicyService accessPolicyService;

    @GetMapping("/me")
    public ResponseEntity<?> getMyAccessPolicy(HttpServletRequest request) {
        String accessLevelValue = (String) request.getAttribute("accessLevel");
        AccessLevel accessLevel = AccessLevel.FREE;
        if (accessLevelValue != null && !accessLevelValue.isBlank()) {
            accessLevel = AccessLevel.valueOf(accessLevelValue);
        }

        return ResponseEntity.ok(Map.of(
            "accessLevel", accessLevel.name(),
            "allowedPages", accessPolicyService.getAllowedPages(accessLevel)
        ));
    }
}
