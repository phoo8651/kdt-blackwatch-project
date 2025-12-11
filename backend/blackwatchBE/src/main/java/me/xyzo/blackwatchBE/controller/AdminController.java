package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.xyzo.blackwatchBE.dto.ContributionApplicationStatusDto;
import me.xyzo.blackwatchBE.dto.MessageResponseDto;
import me.xyzo.blackwatchBE.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Admin management API")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/applications")
    @Operation(summary = "Get all contribution applications", description = "Get list of all contribution applications")
    public ResponseEntity<List<ContributionApplicationStatusDto>> getAllApplications() {
        return ResponseEntity.ok(adminService.getAllApplications());
    }

    @GetMapping("/applications/pending")
    @Operation(summary = "Get pending applications", description = "Get list of pending contribution applications")
    public ResponseEntity<List<ContributionApplicationStatusDto>> getPendingApplications() {
        return ResponseEntity.ok(adminService.getPendingApplications());
    }

    @PostMapping("/applications/{userId}/approve")
    @Operation(summary = "Approve contribution application", description = "Approve a pending contribution application")
    public ResponseEntity<MessageResponseDto> approveApplication(@PathVariable String userId) {
        adminService.approveApplication(userId);
        return ResponseEntity.ok(new MessageResponseDto("Application has been approved."));
    }

    @PostMapping("/applications/{userId}/deny")
    @Operation(summary = "Deny contribution application", description = "Deny a pending contribution application")
    public ResponseEntity<MessageResponseDto> denyApplication(@PathVariable String userId) {
        adminService.denyApplication(userId);
        return ResponseEntity.ok(new MessageResponseDto("Application has been denied."));
    }

    @PostMapping("/applications/{userId}/reset")
    @Operation(summary = "Reset application to pending", description = "Reset application status back to pending")
    public ResponseEntity<MessageResponseDto> resetApplicationToPending(@PathVariable String userId) {
        adminService.resetApplicationToPending(userId);
        return ResponseEntity.ok(new MessageResponseDto("Application status has been reset to pending."));
    }
}
