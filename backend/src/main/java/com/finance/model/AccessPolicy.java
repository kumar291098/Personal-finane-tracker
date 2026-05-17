package com.finance.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "access_policies")
public class AccessPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", unique = true, nullable = false)
    private AccessLevel accessLevel;

    @Column(name = "allowed_pages", nullable = false, length = 1000)
    private String allowedPages;

    public AccessPolicy() {}

    public AccessPolicy(AccessLevel accessLevel, String allowedPages) {
        this.accessLevel = accessLevel;
        this.allowedPages = allowedPages;
    }

    public Long getId() {
        return id;
    }

    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
    }

    public String getAllowedPages() {
        return allowedPages;
    }

    public void setAllowedPages(String allowedPages) {
        this.allowedPages = allowedPages;
    }
}
