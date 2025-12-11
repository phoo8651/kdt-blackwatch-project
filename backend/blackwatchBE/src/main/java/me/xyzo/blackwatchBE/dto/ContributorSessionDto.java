package me.xyzo.blackwatchBE.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "기여자 MongoDB 세션 정보")
public class ContributorSessionDto {

    @Schema(description = "세션 ID", example = "01HKDX123456789ABCDEF")
    private String sessionId;

    @Schema(description = "클라이언트 ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String clientId;

    @Schema(description = "세션 생성 시 IP 주소", example = "192.168.1.100")
    private String ip;

    @Schema(description = "세션 생성 시간", example = "2025-08-17T04:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "세션 만료 시간", example = "2025-08-18T04:30:00")
    private LocalDateTime expiresAt;

    // Getter / Setter
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getIp() { return ip; }
    public void setIp(String ip) { this.ip = ip; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}