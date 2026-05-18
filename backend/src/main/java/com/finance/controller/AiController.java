package com.finance.controller;

import com.finance.dto.AiChatRequest;
import com.finance.dto.AiChatResponse;
import com.finance.model.Transaction;
import com.finance.model.User;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import com.finance.service.FinancialAiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private static final Duration CACHE_TTL = Duration.ofSeconds(30);

    private final FinancialAiService financialAiService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final Map<Long, CachedAiContext> contextCache = new ConcurrentHashMap<>();

    public AiController(
            FinancialAiService financialAiService,
            TransactionRepository transactionRepository,
            UserRepository userRepository) {
        this.financialAiService = financialAiService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, HttpServletRequest httpRequest) {
        Long authenticatedUserId = (Long) httpRequest.getAttribute("userId");
        if (authenticatedUserId == null) {
            return ResponseEntity.status(401).body(new AiChatResponse("Please log in again."));
        }

        CachedAiContext context = getCachedContext(authenticatedUserId);
        String message = request == null ? "" : request.getMessage();
        String reply = financialAiService.reply(message, context.user().orElse(null), context.transactions());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }

    private CachedAiContext getCachedContext(Long userId) {
        CachedAiContext cachedContext = contextCache.get(userId);
        if (cachedContext != null && cachedContext.isFresh()) {
            return cachedContext;
        }

        CachedAiContext context = new CachedAiContext(
                Optional.ofNullable(userRepository.findById(userId).orElse(null)),
                transactionRepository.findByUserId(userId),
                Instant.now()
        );
        contextCache.put(userId, context);
        return context;
    }

    private record CachedAiContext(Optional<User> user, List<Transaction> transactions, Instant createdAt) {
        boolean isFresh() {
            return createdAt.plus(CACHE_TTL).isAfter(Instant.now());
        }
    }
}
