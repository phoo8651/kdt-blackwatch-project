package me.xyzo.blackwatchBE.dto;

import java.time.LocalDateTime;

public class ClientSecretInfoDto {
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    public ClientSecretInfoDto(LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
