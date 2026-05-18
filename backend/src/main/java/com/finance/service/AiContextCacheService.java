package com.finance.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finance.model.AccessLevel;
import com.finance.model.Transaction;
import com.finance.model.User;
import com.finance.monitoring.AiCacheMetrics;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class AiContextCacheService {
    private static final Duration TTL = Duration.ofSeconds(30);

    private final Optional<StringRedisTemplate> redisTemplate;
    private final ObjectMapper objectMapper;
    private final AiCacheMetrics metrics;
    private final boolean redisConfigured;

    public AiContextCacheService(
            Optional<StringRedisTemplate> redisTemplate,
            ObjectMapper objectMapper,
            AiCacheMetrics metrics,
            @Value("${app.redis.url:}") String redisUrl) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.metrics = metrics;
        this.redisConfigured = redisUrl != null && !redisUrl.isBlank();
    }

    public Optional<CachedAiContext> get(Long userId) {
        long startNanos = System.nanoTime();
        if (!redisConfigured || redisTemplate.isEmpty()) {
            metrics.recordCacheDisabled(System.nanoTime() - startNanos);
            return Optional.empty();
        }

        try {
            String payload = redisTemplate.get().opsForValue().get(key(userId));
            if (payload == null || payload.isBlank()) {
                metrics.recordCacheMiss(System.nanoTime() - startNanos);
                return Optional.empty();
            }
            CachedAiContext cachedContext = objectMapper.readValue(payload, CachedAiContext.class);
            metrics.recordCacheHit(System.nanoTime() - startNanos);
            return Optional.of(cachedContext);
        } catch (Exception error) {
            metrics.recordCacheError(System.nanoTime() - startNanos);
            return Optional.empty();
        }
    }

    public void put(Long userId, User user, List<Transaction> transactions) {
        if (!redisConfigured || redisTemplate.isEmpty()) {
            return;
        }

        try {
            CachedUser cachedUser = user == null ? null : CachedUser.from(user);
            List<CachedTransaction> cachedTransactions = transactions.stream()
                    .map(CachedTransaction::from)
                    .toList();
            String payload = objectMapper.writeValueAsString(new CachedAiContext(cachedUser, cachedTransactions));
            redisTemplate.get().opsForValue().set(key(userId), payload, TTL);
            metrics.recordCachePut();
        } catch (Exception ignored) {
            metrics.recordCacheError(0);
            // Redis should improve performance, not break chat if unavailable.
        }
    }

    private String key(Long userId) {
        return "finance:ai-context:user:" + userId;
    }

    public record CachedAiContext(CachedUser user, List<CachedTransaction> transactions) {
        public Optional<CachedUser> optionalUser() {
            return Optional.ofNullable(user);
        }
    }

    public record CachedUser(
            Long id,
            String username,
            String firstName,
            String lastName,
            String accessLevel,
            LocalDateTime subscriberUntil) {
        static CachedUser from(User user) {
            return new CachedUser(
                    user.getId(),
                    user.getUsername(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getAccessLevel().name(),
                    user.getSubscriberUntil());
        }
    }

    public record CachedTransaction(
            Long id,
            String description,
            String type,
            Double amount,
            String category,
            Long categoryId,
            LocalDate transactionDate) {
        static CachedTransaction from(Transaction transaction) {
            return new CachedTransaction(
                    transaction.getId(),
                    transaction.getDescription(),
                    transaction.getType(),
                    transaction.getAmount(),
                    transaction.getCategory(),
                    transaction.getCategoryId(),
                    transaction.getTransactionDate());
        }

        public Transaction toTransaction() {
            Transaction transaction = new Transaction();
            transaction.setId(id);
            transaction.setDescription(description);
            transaction.setType(type);
            transaction.setAmount(amount);
            transaction.setCategory(category);
            transaction.setCategoryId(categoryId);
            transaction.setTransactionDate(transactionDate);
            return transaction;
        }
    }

    public static User toUser(CachedUser cachedUser) {
        if (cachedUser == null) {
            return null;
        }

        User user = new User();
        user.setUsername(cachedUser.username());
        user.setFirstName(cachedUser.firstName());
        user.setLastName(cachedUser.lastName());
        user.setSubscriberUntil(cachedUser.subscriberUntil());
        try {
            user.setAccessLevel(AccessLevel.valueOf(cachedUser.accessLevel()));
        } catch (Exception ignored) {
            user.setAccessLevel(AccessLevel.FREE);
        }
        return user;
    }
}
