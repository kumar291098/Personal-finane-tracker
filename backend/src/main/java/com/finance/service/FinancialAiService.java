package com.finance.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.finance.model.Transaction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class FinancialAiService {
    private final RestClient restClient;

    @Value("${openai.api.key:}")
    private String openAiApiKey;

    @Value("${openai.model:gpt-5-mini}")
    private String model;

    public FinancialAiService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder
                .baseUrl("https://api.openai.com/v1")
                .build();
    }

    public String reply(String message, List<Transaction> transactions) {
        if (message == null || message.trim().isEmpty()) {
            return "Ask me about spending, savings, budgets, or recent transactions.";
        }

        String directAnswer = answerTransactionLookup(message, transactions);
        if (directAnswer != null) {
            return directAnswer;
        }

        String summary = buildTransactionSummary(transactions);
        if (openAiApiKey == null || openAiApiKey.isBlank()) {
            return fallbackReply(message, summary);
        }

        try {
            return callOpenAi(message.trim(), summary);
        } catch (Exception error) {
            return "I could not reach the AI service, but here is your current snapshot: " + summary;
        }
    }

    private String answerTransactionLookup(String message, List<Transaction> transactions) {
        String normalizedMessage = message.toLowerCase();

        if (normalizedMessage.contains("today")) {
            java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Kolkata"));
            List<Transaction> todaysTransactions = transactions.stream()
                    .filter(transaction -> transaction.getTransactionDate() != null)
                    .filter(transaction -> transaction.getTransactionDate().equals(today))
                    .sorted(Comparator.comparing(Transaction::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                    .toList();

            if (todaysTransactions.isEmpty()) {
                return "I found no transactions for today.";
            }

            return "Today's transactions:\n" + formatTransactions(todaysTransactions);
        }

        Integer requestedCount = extractRequestedCount(normalizedMessage);
        if (requestedCount != null && (
                normalizedMessage.contains("last")
                        || normalizedMessage.contains("recent")
                        || normalizedMessage.contains("latest")
        )) {
            List<Transaction> recentTransactions = transactions.stream()
                    .sorted(Comparator
                            .comparing(Transaction::getTransactionDate, Comparator.nullsLast(Comparator.reverseOrder()))
                            .thenComparing(Transaction::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                    .limit(requestedCount)
                    .toList();

            if (recentTransactions.isEmpty()) {
                return "I found no transactions yet.";
            }

            return "Last " + recentTransactions.size() + " transactions:\n" + formatTransactions(recentTransactions);
        }

        return null;
    }

    private Integer extractRequestedCount(String message) {
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("\\b(\\d{1,2})\\b").matcher(message);
        if (!matcher.find()) {
            return null;
        }

        int count = Integer.parseInt(matcher.group(1));
        return Math.max(1, Math.min(count, 10));
    }

    private String formatTransactions(List<Transaction> transactions) {
        return transactions.stream()
                .map(transaction -> "- " + transaction.getTransactionDate()
                        + " | " + transaction.getType()
                        + " | INR " + Math.round(transaction.getAmount() == null ? 0 : transaction.getAmount())
                        + " | " + nullSafe(transaction.getCategory())
                        + " | " + nullSafe(transaction.getDescription()))
                .collect(Collectors.joining("\n"));
    }

    private String nullSafe(String value) {
        return value == null || value.isBlank() ? "No details" : value;
    }

    private String callOpenAi(String message, String summary) {
        Map<String, Object> requestBody = Map.of(
                "model", model,
                "input", """
                        You are a careful personal finance assistant inside a finance tracker app.
                        Do not give legal, tax, or investment advice. Use the user's transaction summary only.
                        Transaction summary: %s
                        User question: %s
                        """.formatted(summary, message)
        );

        JsonNode response = restClient.post()
                .uri("/responses")
                .header("Authorization", "Bearer " + openAiApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        if (response == null) {
            return "I could not prepare a response right now.";
        }

        JsonNode outputText = response.get("output_text");
        if (outputText != null && !outputText.asText().isBlank()) {
            return outputText.asText();
        }

        return extractTextFromOutput(response);
    }

    private String extractTextFromOutput(JsonNode response) {
        JsonNode output = response.get("output");
        if (output == null || !output.isArray()) {
            return "I could not prepare a response right now.";
        }

        StringBuilder builder = new StringBuilder();
        output.forEach(item -> {
            JsonNode content = item.get("content");
            if (content != null && content.isArray()) {
                content.forEach(contentItem -> {
                    JsonNode text = contentItem.get("text");
                    if (text != null && !text.asText().isBlank()) {
                        builder.append(text.asText()).append("\n");
                    }
                });
            }
        });

        return builder.isEmpty() ? "I could not prepare a response right now." : builder.toString().trim();
    }

    private String buildTransactionSummary(List<Transaction> transactions) {
        double income = transactions.stream()
                .filter(transaction -> "INCOME".equals(transaction.getType()))
                .mapToDouble(transaction -> transaction.getAmount() == null ? 0 : transaction.getAmount())
                .sum();

        double expenses = transactions.stream()
                .filter(transaction -> "EXPENSE".equals(transaction.getType()))
                .mapToDouble(transaction -> transaction.getAmount() == null ? 0 : transaction.getAmount())
                .sum();

        String topCategories = transactions.stream()
                .filter(transaction -> "EXPENSE".equals(transaction.getType()))
                .filter(transaction -> transaction.getCategory() != null && !transaction.getCategory().isBlank())
                .collect(Collectors.groupingBy(Transaction::getCategory, Collectors.summingDouble(
                        transaction -> transaction.getAmount() == null ? 0 : transaction.getAmount()
                )))
                .entrySet()
                .stream()
                .sorted(Map.Entry.<String, Double>comparingByValue(Comparator.reverseOrder()))
                .limit(3)
                .map(entry -> entry.getKey() + ": INR " + Math.round(entry.getValue()))
                .collect(Collectors.joining(", "));

        return "income INR " + Math.round(income)
                + ", expenses INR " + Math.round(expenses)
                + ", balance INR " + Math.round(income - expenses)
                + ", transactions " + transactions.size()
                + (topCategories.isBlank() ? "" : ", top expense categories " + topCategories);
    }

    private String fallbackReply(String message, String summary) {
        String normalizedMessage = message.toLowerCase();
        if (normalizedMessage.contains("budget")) {
            return "AI is not configured yet, but based on your saved data you can start with this snapshot: "
                    + summary + ". Try setting one monthly limit for your biggest expense category first.";
        }

        if (normalizedMessage.contains("save") || normalizedMessage.contains("saving")) {
            return "AI is not configured yet, but here is a simple savings check: "
                    + summary + ". If expenses are close to income, reduce the highest flexible category first.";
        }

        return "AI is not configured yet. Current finance snapshot: " + summary
                + ". Set OPENAI_API_KEY on the backend to enable full AI answers.";
    }
}
