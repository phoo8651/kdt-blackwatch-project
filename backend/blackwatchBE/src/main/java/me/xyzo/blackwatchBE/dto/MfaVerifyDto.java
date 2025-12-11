package me.xyzo.blackwatchBE.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class MfaVerifyDto {
    @NotBlank
    private String sessionKey;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String code;

    public String getSessionKey() { return sessionKey; }
    public void setSessionKey(String sessionKey) { this.sessionKey = sessionKey; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
