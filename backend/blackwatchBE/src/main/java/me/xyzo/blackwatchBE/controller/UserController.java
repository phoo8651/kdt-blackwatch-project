package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.xyzo.blackwatchBE.dto.UserProfileDto;
import me.xyzo.blackwatchBE.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@Tag(name = "Users", description = "User information query API")
public class UserController {

    @Autowired
    private AccountService accountService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user profile", description = "Get another user's profile information")
    public ResponseEntity<UserProfileDto> getUserProfile(@PathVariable String userId) {
        return ResponseEntity.ok(accountService.getUserProfile(userId));
    }
}