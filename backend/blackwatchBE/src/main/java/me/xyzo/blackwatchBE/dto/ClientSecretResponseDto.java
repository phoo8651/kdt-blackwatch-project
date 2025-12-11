package me.xyzo.blackwatchBE.dto;

import java.time.LocalDateTime;

public class ClientSecretResponseDto {
    private String clientId;
    private String clientSecret;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public ClientSecretResponseDto(String clientId, String clientSecret, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
