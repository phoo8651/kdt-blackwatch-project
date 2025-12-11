package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import me.xyzo.blackwatchBE.dto.*;
import me.xyzo.blackwatchBE.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@Tag(name = "Authentication", description = "Login/Signup/Authentication API")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup/request")
    @Operation(summary = "Request signup verification", description = "Send verification code to email. Cannot request again within 5 minutes")
    public ResponseEntity<MessageResponseDto> signupRequest(@Valid @RequestBody SignupRequestDto request) {
        authService.sendSignupVerificationCode(request.getEmail());
        return ResponseEntity.ok(new MessageResponseDto("Verification code has been sent to your email."));
    }

    @PostMapping("/signup/verify")
    @Operation(summary = "Verify signup code and create account", description = "Verify email code and complete account creation")
    public ResponseEntity<MessageResponseDto> signupVerify(@Valid @RequestBody SignupVerifyDto request) {
        authService.verifySignupAndCreateAccount(request);
        return ResponseEntity.ok(new MessageResponseDto("Account registration completed."));
    }

    @PostMapping("/signin")
    @Operation(summary = "Sign in", description = "ID/PW authentication with MFA branching")
    public ResponseEntity<?> signin(@Valid @RequestBody SigninRequestDto request) {
        return authService.signin(request);
    }

    @PostMapping("/mfa")
    @Operation(summary = "MFA verification", description = "Additional authentication for MFA-enabled users")
    public ResponseEntity<SigninResponseDto> mfaVerify(@Valid @RequestBody MfaVerifyDto request) {
        return ResponseEntity.ok(authService.verifyMfa(request));
    }

    @GetMapping("/mfa/resend")
    @Operation(summary = "Resend MFA code", description = "Resend MFA verification code")
    public ResponseEntity<MfaResponseDto> mfaResend(@RequestParam String sessionKey) {
        return ResponseEntity.ok(authService.resendMfaCode(sessionKey));
    }

    @GetMapping("/mfa/enable")
    @Operation(summary = "Enable MFA", description = "Enable multi-factor authentication")
    public ResponseEntity<MessageResponseDto> enableMfa() {
        authService.enableMfa();
        return ResponseEntity.ok(new MessageResponseDto("Multi-factor authentication has been enabled."));
    }

    @GetMapping("/mfa/disable")
    @Operation(summary = "Disable MFA", description = "Disable multi-factor authentication (not allowed for contributors)")
    public ResponseEntity<MessageResponseDto> disableMfa() {
        authService.disableMfa();
        return ResponseEntity.ok(new MessageResponseDto("Multi-factor authentication has been disabled."));
    }

    @PostMapping("/reset-password/request")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<MessageResponseDto> resetPasswordRequest(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.sendResetPasswordCode(request.getEmail());
        return ResponseEntity.ok(new MessageResponseDto("Verification code has been sent to your email."));
    }

    @PostMapping("/reset-password/confirm")
    @Operation(summary = "Confirm password reset")
    public ResponseEntity<MessageResponseDto> resetPasswordConfirm(@Valid @RequestBody ResetPasswordConfirmDto request) {
        authService.confirmResetPassword(request);
        return ResponseEntity.ok(new MessageResponseDto("Password has been updated."));
    }
}