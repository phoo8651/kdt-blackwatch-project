package me.xyzo.blackwatchBE.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "client_secrets")
public class ClientSecret {

    @Id
    @Column(length = 36)
    private String clientId;

    @Column(nullable = false, length = 32)
    private String clientSecret;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    // Constructors
    public ClientSecret() {}

    public ClientSecret(String clientId, String clientSecret, LocalDateTime expiresAt) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.expiresAt = expiresAt;
    }

    // Getters and Setters
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getClientSecret() { return clientSecret; }
    public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
}
