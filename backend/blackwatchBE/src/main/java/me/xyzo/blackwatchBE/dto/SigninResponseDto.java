package me.xyzo.blackwatchBE.dto;

public class SigninResponseDto {
    private String accessToken;
    private String expiresAt;
    private String role;

    public SigninResponseDto(String accessToken, String expiresAt, String role) {
        this.accessToken = accessToken;
        this.expiresAt = expiresAt;
        this.role = role;
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
