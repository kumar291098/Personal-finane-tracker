package com.finance.service;

import com.finance.model.SubscriptionSettings;
import com.finance.repository.SubscriptionSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionSettingsService {

    private static final Long SETTINGS_ID = 1L;

    @Autowired
    private SubscriptionSettingsRepository subscriptionSettingsRepository;

    @Value("${subscription.subscriber.amount-paise:9900}")
    private int defaultAmountPaise;

    @Value("${subscription.upi.id:}")
    private String defaultUpiId;

    @Value("${subscription.upi.qr-image-url:}")
    private String defaultUpiQrImageUrl;

    public SubscriptionSettings getSettings() {
        return subscriptionSettingsRepository.findById(SETTINGS_ID)
            .orElseGet(this::createDefaultSettings);
    }

    public SubscriptionSettings updateSettings(Integer amountPaise, String upiId, String upiQrImageUrl) {
        SubscriptionSettings settings = getSettings();
        if (amountPaise != null && amountPaise > 0) {
            settings.setAmountPaise(amountPaise);
        }
        settings.setUpiId(normalize(upiId));
        settings.setUpiQrImageUrl(normalize(upiQrImageUrl));
        return subscriptionSettingsRepository.save(settings);
    }

    private SubscriptionSettings createDefaultSettings() {
        SubscriptionSettings settings = new SubscriptionSettings();
        settings.setId(SETTINGS_ID);
        settings.setAmountPaise(defaultAmountPaise);
        settings.setUpiId(normalize(defaultUpiId));
        settings.setUpiQrImageUrl(normalize(defaultUpiQrImageUrl));
        return subscriptionSettingsRepository.save(settings);
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "";
        }
        return value.trim();
    }
}
