package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "col_sessions")
public class SessionDocument {
    @Id
    private String id; // sessionId

    @Field("clientId")
    private String clientId;

    @Field("userId")
    private String userId;

    @Field("userIp")
    private String userIp;

    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("expiresAt")
    private LocalDateTime expiresAt;

    // Constructors
    public SessionDocument() {}

    public SessionDocument(String sessionId, String clientId, String userId, String userIp) {
        this.id = sessionId;
        this.clientId = clientId;
        this.userId = userId;
        this.userIp = userIp;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7); // 7일 후 만료
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserIp() { return userIp; }
    public void setUserIp(String userIp) { this.userIp = userIp; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}