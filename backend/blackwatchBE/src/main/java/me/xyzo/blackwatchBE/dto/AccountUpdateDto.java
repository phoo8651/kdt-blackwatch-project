package me.xyzo.blackwatchBE.dto;

public class AccountUpdateDto {
    private String username;
    private String locale;
    private String timeZone;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getTimeZone() { return timeZone; }
    public void setTimeZone(String timeZone) { this.timeZone = timeZone; }
}