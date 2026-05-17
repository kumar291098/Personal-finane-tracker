package com.finance.repository;

import com.finance.model.SubscriptionSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionSettingsRepository extends JpaRepository<SubscriptionSettings, Long> {
}
