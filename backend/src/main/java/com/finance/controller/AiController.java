package com.finance.controller;

import com.finance.dto.AiChatRequest;
import com.finance.dto.AiChatResponse;
import com.finance.model.Transaction;
import com.finance.repository.TransactionRepository;
import com.finance.service.FinancialAiService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    private final FinancialAiService financialAiService;
    private final TransactionRepository transactionRepository;

    public AiController(FinancialAiService financialAiService, TransactionRepository transactionRepository) {
        this.financialAiService = financialAiService;
        this.transactionRepository = transactionRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request, HttpServletRequest httpRequest) {
        Long authenticatedUserId = (Long) httpRequest.getAttribute("userId");
        if (authenticatedUserId == null) {
            return ResponseEntity.status(401).body(new AiChatResponse("Please log in again."));
        }

        List<Transaction> transactions = transactionRepository.findByUserId(authenticatedUserId);
        String message = request == null ? "" : request.getMessage();
        String reply = financialAiService.reply(message, transactions);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}
