package me.xyzo.blackwatchBE.dto;

public class ContributorInfoDto {
    private String userId;
    private String clientId;
    private ClientSecretInfoDto clientSecret;
    private String status;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }

    public ClientSecretInfoDto getClientSecret() { return clientSecret; }
    public void setClientSecret(ClientSecretInfoDto clientSecret) { this.clientSecret = clientSecret; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
