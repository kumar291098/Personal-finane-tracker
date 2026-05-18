package com.finance.controller;

import com.finance.dto.AiChatRequest;
import com.finance.dto.AiChatResponse;
import com.finance.model.Transaction;
import com.finance.model.User;
import com.finance.repository.TransactionRepository;
import com.finance.repository.UserRepository;
import com.finance.service.AiContextCacheService;
import com.finance.service.FinancialAiService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final FinancialAiService financialAiService;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AiContextCacheService aiContextCacheService;

    public AiController(
            FinancialAiService financialAiService,
            TransactionRepository transactionRepository,
            UserRepository userRepository,
            AiContextCacheService aiContextCacheService) {
        this.financialAiService = financialAiService;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
        this.aiContextCacheService = aiContextCacheService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, HttpServletRequest httpRequest) {
        Long authenticatedUserId = (Long) httpRequest.getAttribute("userId");
        if (authenticatedUserId == null) {
            return ResponseEntity.status(401).body(new AiChatResponse("Please log in again."));
        }

        AiContext context = getAiContext(authenticatedUserId);
        String message = request == null ? "" : request.getMessage();
        String reply = financialAiService.reply(message, context.user(), context.transactions());
        return ResponseEntity.ok(new AiChatResponse(reply));
    }

    private AiContext getAiContext(Long userId) {
        return aiContextCacheService.get(userId)
                .map(cached -> new AiContext(
                        AiContextCacheService.toUser(cached.user()),
                        cached.transactions().stream()
                                .map(AiContextCacheService.CachedTransaction::toTransaction)
                                .toList()))
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    List<Transaction> transactions = transactionRepository.findByUserId(userId);
                    aiContextCacheService.put(userId, user, transactions);
                    return new AiContext(user, transactions);
                });
    }

    private record AiContext(User user, List<Transaction> transactions) {}
}
