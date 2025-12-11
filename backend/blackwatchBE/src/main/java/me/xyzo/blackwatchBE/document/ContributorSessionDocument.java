package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "contributor_sessions")
public class ContributorSessionDocument {

    @Id
    private String sessionId;

    @Field("clientId")
    private String clientId;

    @Field("userId")
    private String userId;

    @Field("ipAddress")
    private String ipAddress;

    @Field("userAgent")
    private String userAgent;

    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("expiresAt")
    private LocalDateTime expiresAt;

    @Field("lastAccessedAt")
    private LocalDateTime lastAccessedAt;

    @Field("isActive")
    private boolean isActive = true;

    @Field("sessionType")
    private String sessionType = "DIRECT_MONGODB";

    @Field("permissions")
    private String[] permissions;

    // Constructors
    public ContributorSessionDocument() {
    }

    public ContributorSessionDocument(String sessionId, String clientId, String userId,
                                      String ipAddress, LocalDateTime expiresAt) {
        this.sessionId = sessionId;
        this.clientId = clientId;
        this.userId = userId;
        this.ipAddress = ipAddress;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = expiresAt;
        this.lastAccessedAt = LocalDateTime.now();
        this.permissions = new String[]{"read", "write"};
    }
    // Getter/Setter
    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getUserAgent() { return userAgent; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getLastAccessedAt() { return lastAccessedAt; }
    public void setLastAccessedAt(LocalDateTime lastAccessedAt) { this.lastAccessedAt = lastAccessedAt; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public String[] getPermissions() { return permissions; }
    public void setPermissions(String[] permissions) { this.permissions = permissions; }
}
