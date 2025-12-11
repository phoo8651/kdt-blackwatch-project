package me.xyzo.blackwatchBE.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ResetPasswordConfirmDto {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String code;

    @NotBlank
    private String password;

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
