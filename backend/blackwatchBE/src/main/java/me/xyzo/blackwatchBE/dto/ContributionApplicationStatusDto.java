package me.xyzo.blackwatchBE.dto;

import java.time.LocalDateTime;

public class ContributionApplicationStatusDto {
    private String userId;
    private String clientId;
    private String status;
    private String jobs;
    private String motivation;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getJobs() { return jobs; }
    public void setJobs(String jobs) { this.jobs = jobs; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
