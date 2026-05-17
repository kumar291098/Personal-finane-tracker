package com.finance.controller;

import com.finance.service.DemoSubscriptionReferenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/subscription")
public class PublicSubscriptionDemoController {

    @Autowired
    private DemoSubscriptionReferenceService demoSubscriptionReferenceService;

    @GetMapping("/demo-reference")
    public Map<String, Object> createDemoReference() {
        return demoSubscriptionReferenceService.createReference();
    }
}
