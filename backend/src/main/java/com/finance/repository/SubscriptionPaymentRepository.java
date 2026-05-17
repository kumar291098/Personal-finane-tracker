package com.finance.repository;

import com.finance.model.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, Long> {
    Optional<SubscriptionPayment> findByOrderId(String orderId);
}
