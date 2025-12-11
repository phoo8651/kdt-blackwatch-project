package me.xyzo.blackwatchBE.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "contribution_applications")
public class ContributionApplication {

    @Id
    @Column(length = 36)
    private String userId;

    @Column(length = 36)
    private String clientId;

    @Column(nullable = false)
    private String contact;

    @Column(nullable = false)
    private String handle;

    @Column(nullable = false)
    private String jobs;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String motivation;

    @Column(nullable = false)
    private boolean law;

    @Column(nullable = false)
    private boolean license;

    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum Status {
        PENDING, ACCEPT, DENIED
    }

    // Constructors
    public ContributionApplication() {}

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getHandle() { return handle; }
    public void setHandle(String handle) { this.handle = handle; }

    public String getJobs() { return jobs; }
    public void setJobs(String jobs) { this.jobs = jobs; }

    public String getMotivation() { return motivation; }
    public void setMotivation(String motivation) { this.motivation = motivation; }

    public boolean isLaw() { return law; }
    public void setLaw(boolean law) { this.law = law; }

    public boolean isLicense() { return license; }
    public void setLicense(boolean license) { this.license = license; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}