package com.finance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_settings")
public class SubscriptionSettings {

    @Id
    private Long id = 1L;

    @Column(nullable = false)
    private Integer amountPaise = 9900;

    private String upiId;

    @Column(columnDefinition = "TEXT")
    private String upiQrImageUrl;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getAmountPaise() {
        return amountPaise;
    }

    public void setAmountPaise(Integer amountPaise) {
        this.amountPaise = amountPaise;
    }

    public String getUpiId() {
        return upiId;
    }

    public void setUpiId(String upiId) {
        this.upiId = upiId;
    }

    public String getUpiQrImageUrl() {
        return upiQrImageUrl;
    }

    public void setUpiQrImageUrl(String upiQrImageUrl) {
        this.upiQrImageUrl = upiQrImageUrl;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
