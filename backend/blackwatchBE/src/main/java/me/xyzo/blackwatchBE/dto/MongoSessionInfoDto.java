package me.xyzo.blackwatchBE.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "MongoDB 직접 연결 세션 정보")
public class MongoSessionInfoDto {

    @Schema(description = "세션 ID", example = "01HKDX123456789ABCDEF")
    private String sessionId;

    @Schema(description = "클라이언트 ID", example = "550e8400-e29b-41d4-a716-446655440000")
    private String clientId;

    @Schema(description = "MongoDB 연결 문자열",
            example = "mongodb://contributor_clientid:password@3.38.39.200:27017/blackwatch_data?authSource=admin")
    private String connectionString;

    @Schema(description = "데이터베이스 이름", example = "blackwatch_data")
    private String databaseName;

    @Schema(description = "MongoDB 사용자명", example = "contributor_clientid")
    private String username;

    @Schema(description = "MongoDB 비밀번호", example = "securePassword123")
    private String password;

    @Schema(description = "세션 생성 시간", example = "2025-08-17T04:30:00")
    private LocalDateTime createdAt;

    @Schema(description = "세션 만료 시간", example = "2025-08-18T04:30:00")
    private LocalDateTime expiresAt;

    @Schema(description = "권한 목록", example = "[\"read\", \"write\"]")
    private String[] permissions;

    public MongoSessionInfoDto(String sessionId, String clientId, String connectionString,
                               String databaseName, String username, String password,
                               LocalDateTime createdAt, LocalDateTime expiresAt, String[] permissions) {
        this.sessionId = sessionId;
        this.clientId = clientId;
        this.connectionString = connectionString;
        this.databaseName = databaseName;
        this.username = username;
        this.password = password;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.permissions = permissions;
    }

    // Getter / Setter
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getConnectionString() { return connectionString; }
    public void setConnectionString(String connectionString) { this.connectionString = connectionString; }

    public String getDatabaseName() { return databaseName; }
    public void setDatabaseName(String databaseName) { this.databaseName = databaseName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String[] getPermissions() { return permissions; }
    public void setPermissions(String[] permissions) { this.permissions = permissions; }
}