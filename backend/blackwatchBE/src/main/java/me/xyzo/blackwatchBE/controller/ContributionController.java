package me.xyzo.blackwatchBE.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.xyzo.blackwatchBE.dto.*;
import me.xyzo.blackwatchBE.service.ContributionService;
import me.xyzo.blackwatchBE.service.MongoSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/contrib")
@Tag(name = "Contribution", description = "Contributor application and management API")
public class ContributionController {

    @Autowired
    private ContributionService contributionService;

    @Autowired
    private MongoSessionService mongoSessionService;

    @PostMapping("/applications")
    @Operation(summary = "Submit contribution application", description = "Submit application to become a contributor")
    public ResponseEntity<ContributionApplicationResponseDto> submitApplication(@RequestBody ContributionApplicationDto request) {
        ContributionApplicationResponseDto response = contributionService.submitApplication(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/applications/me")
    @Operation(summary = "Check application status", description = "Check current application status")
    public ResponseEntity<ContributionApplicationStatusDto> getMyApplicationStatus() {
        return ResponseEntity.ok(contributionService.getMyApplicationStatus());
    }

    @PostMapping("/secret")
    @Operation(summary = "Generate client secret", description = "Generate new client secret (previous secret will be revoked)")
    public ResponseEntity<ClientSecretResponseDto> generateClientSecret() {
        ClientSecretResponseDto response = contributionService.generateClientSecret();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get contributor info", description = "Get my contributor status and information")
    public ResponseEntity<ContributorInfoDto> getMyContributorInfo() {
        return ResponseEntity.ok(contributionService.getMyContributorInfo());
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get sessions", description = "Get session data from MongoDB")
    public ResponseEntity<List<ContributorSessionDto>> getSessions() {
        return ResponseEntity.ok(contributionService.getSessions());
    }

    @DeleteMapping("/sessions")
    @Operation(summary = "Delete sessions", description = "Delete sessions from MongoDB")
    public ResponseEntity<MessageResponseDto> deleteSessions() {
        contributionService.deleteSessions();
        return ResponseEntity.ok(new MessageResponseDto("Sessions have been deleted."));
    }

    // ===== MongoDB Direct Session APIs =====

    @PostMapping("/mongo-sessions")
    @Operation(
            summary = "Create MongoDB direct connection session",
            description = "Create a session for contributors to directly connect to MongoDB and input data",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Session created successfully"),
                    @ApiResponse(responseCode = "400", description = "Bad request (session limit exceeded, etc.)"),
                    @ApiResponse(responseCode = "403", description = "No contributor permission"),
                    @ApiResponse(responseCode = "429", description = "Concurrent session limit exceeded")
            }
    )
    public ResponseEntity<MongoSessionInfoDto> createMongoSession(
            @RequestBody(required = false)
            @Schema(description = "Session creation options (optional)")
            MongoSessionCreateDto request,
            HttpServletRequest httpRequest
    ) {
        String userId = getCurrentUserId();
        String ipAddress = getClientIpAddress(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        MongoSessionInfoDto sessionInfo =
                mongoSessionService.createDirectMongoSession(userId, ipAddress, userAgent);
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionInfo);
    }

    @GetMapping("/mongo-sessions")
    @Operation(
            summary = "Get my MongoDB sessions",
            description = "Get list of active MongoDB direct connection sessions",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Session list retrieved successfully"),
                    @ApiResponse(responseCode = "401", description = "Authentication required")
            }
    )
    public ResponseEntity<List<ContributorSessionDto>> getMyMongoSessions() {
        String userId = getCurrentUserId();
        List<ContributorSessionDto> sessions = mongoSessionService.getUserActiveSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/mongo-sessions/{sessionId}")
    @Operation(
            summary = "Delete specific MongoDB session",
            description = "Deactivate MongoDB session with specified session ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Session deleted successfully"),
                    @ApiResponse(responseCode = "404", description = "Session not found"),
                    @ApiResponse(responseCode = "403", description = "No permission for this session")
            }
    )
    public ResponseEntity<MessageResponseDto> deleteMongoSession(
            @PathVariable
            @Schema(description = "Session ID to delete", example = "01HKDX123456789ABCDEF")
            String sessionId
    ) {
        String userId = getCurrentUserId();
        mongoSessionService.deleteSession(sessionId, userId);
        return ResponseEntity.ok(new MessageResponseDto("Session has been deleted."));
    }

    @DeleteMapping("/mongo-sessions")
    @Operation(summary = "Delete all MongoDB sessions")
    public ResponseEntity<MessageResponseDto> deleteAllMongoSessions() {
        String userId = getCurrentUserId();
        mongoSessionService.deleteAllUserSessions(userId);
        return ResponseEntity.ok(new MessageResponseDto("All sessions have been deleted."));
    }

    @PutMapping("/mongo-sessions/{sessionId}/extend")
    @Operation(
            summary = "Extend MongoDB session",
            description = "Extend the expiration time of existing session",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Session extended successfully"),
                    @ApiResponse(responseCode = "400", description = "Extension time exceeded (72 hour limit)"),
                    @ApiResponse(responseCode = "404", description = "Session not found")
            }
    )
    public ResponseEntity<MongoSessionInfoDto> extendMongoSession(
            @PathVariable
            @Schema(description = "Session ID to extend", example = "01HKDX123456789ABCDEF")
            String sessionId,
            @RequestParam(defaultValue = "24")
            @Schema(description = "Additional hours", example = "24", minimum = "1", maximum = "72")
            int additionalHours
    ) {
        String userId = getCurrentUserId();
        MongoSessionInfoDto info = mongoSessionService.extendSession(sessionId, userId, additionalHours);
        return ResponseEntity.ok(info);
    }

    // ===== Helpers =====

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}