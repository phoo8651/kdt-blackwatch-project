package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.xyzo.blackwatchBE.dto.AccountUpdateDto;
import me.xyzo.blackwatchBE.dto.UserProfileDto;
import me.xyzo.blackwatchBE.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/account")
@Tag(name = "Account", description = "User account management API")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/me")
    @Operation(summary = "Get my account information")
    public ResponseEntity<UserProfileDto> getMyAccount() {
        return ResponseEntity.ok(accountService.getMyAccount());
    }

    @PatchMapping("/me")
    @Operation(summary = "Update my account information")
    public ResponseEntity<UserProfileDto> updateMyAccount(@RequestBody AccountUpdateDto request) {
        return ResponseEntity.ok(accountService.updateMyAccount(request));
    }
}