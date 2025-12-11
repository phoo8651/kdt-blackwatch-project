package me.xyzo.blackwatchBE.dto;

import java.time.LocalDateTime;

public class ContributionApplicationResponseDto {
    private String userId;
    private String status;
    private LocalDateTime createdAt;

    public ContributionApplicationResponseDto(String userId, String status, LocalDateTime createdAt) {
        this.userId = userId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
