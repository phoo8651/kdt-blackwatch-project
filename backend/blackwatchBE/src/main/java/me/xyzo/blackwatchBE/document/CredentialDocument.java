package me.xyzo.blackwatchBE.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "col_credentials")
public class CredentialDocument {
    @Id
    private String id; // userId

    @Field("clientId")
    private String clientId;

    @Field("clientSecret")
    private String clientSecret;

    @Field("createdAt")
    private LocalDateTime createdAt;

    // Constructors
    public CredentialDocument() {}

    public CredentialDocument(String userId, String clientId, String clientSecret) {
        this.id = userId;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}