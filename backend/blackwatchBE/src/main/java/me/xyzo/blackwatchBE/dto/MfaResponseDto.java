package me.xyzo.blackwatchBE.dto;

public class MfaResponseDto {
    private String sessionKey;
    private boolean needMfa;
    private String message;

    public MfaResponseDto(String sessionKey, boolean needMfa, String message) {
        this.sessionKey = sessionKey;
        this.needMfa = needMfa;
        this.message = message;
    }

    public String getSessionKey() { return sessionKey; }
    public void setSessionKey(String sessionKey) { this.sessionKey = sessionKey; }

    public boolean isNeedMfa() { return needMfa; }
    public void setNeedMfa(boolean needMfa) { this.needMfa = needMfa; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
