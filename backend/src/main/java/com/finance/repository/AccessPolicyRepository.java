package com.finance.repository;

import com.finance.model.AccessLevel;
import com.finance.model.AccessPolicy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccessPolicyRepository extends JpaRepository<AccessPolicy, Long> {
    Optional<AccessPolicy> findByAccessLevel(AccessLevel accessLevel);
}
