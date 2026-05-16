package com.finance.dto;

public class AiChatResponse {
    private String reply;

    public AiChatResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
