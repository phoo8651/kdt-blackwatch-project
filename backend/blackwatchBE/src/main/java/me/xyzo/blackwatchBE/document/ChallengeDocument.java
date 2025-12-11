package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "col_challenge")
public class ChallengeDocument {
    @Id
    private String id; // challengeId

    @Field("clientId")
    private String clientId;

    @Field("nonce")
    private String nonce;

    @Field("expiresAt")
    private LocalDateTime expiresAt;

    @Field("verified")
    private boolean verified = false;

    // Constructors
    public ChallengeDocument() {}

    public ChallengeDocument(String challengeId, String clientId, String nonce, LocalDateTime expiresAt) {
        this.id = challengeId;
        this.clientId = clientId;
        this.nonce = nonce;
        this.expiresAt = expiresAt;
        this.verified = false;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getNonce() { return nonce; }
    public void setNonce(String nonce) { this.nonce = nonce; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
}