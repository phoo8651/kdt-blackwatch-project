package me.xyzo.blackwatchBE.service;

import com.github.f4b6a3.ulid.UlidCreator;
import me.xyzo.blackwatchBE.document.ContributorSessionDocument;
import me.xyzo.blackwatchBE.domain.ContributionApplication;
import me.xyzo.blackwatchBE.dto.ContributorSessionDto;
import me.xyzo.blackwatchBE.dto.MongoSessionInfoDto;
import me.xyzo.blackwatchBE.exception.ForbiddenException;
import me.xyzo.blackwatchBE.exception.MongoSessionException;
import me.xyzo.blackwatchBE.repository.ContributionApplicationRepository;
import me.xyzo.blackwatchBE.repository.ContributorSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MongoSessionService {

    @Autowired
    private ContributorSessionRepository sessionRepository;

    @Autowired
    private ContributionApplicationRepository applicationRepository;

    @Value("${mongo.session.default-duration-hours:24}")
    private int defaultSessionDurationHours;

    @Value("${mongo.session.max-concurrent-sessions:3}")
    private int maxConcurrentSessions;

    @Value("${mongo.session.connection.uri-template}")
    private String mongoUriTemplate;

    @Value("${mongo.session.connection.database:db_challenges}")  // 기본값을 db_challenges로 설정
    private String mongoDatabase;

    public MongoSessionInfoDto createDirectMongoSession(String userId, String ipAddress, String userAgent) {
        // 기여자 권한 확인
        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new ForbiddenException("기여자 권한이 없습니다."));

        if (!application.getStatus().equals(ContributionApplication.Status.ACCEPT)) {
            throw new ForbiddenException("승인된 기여자만 MongoDB 세션을 생성할 수 있습니다.");
        }

        // 현재 활성 세션 수 확인
        List<ContributorSessionDocument> activeSessions =
                sessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());

        if (activeSessions.size() >= maxConcurrentSessions) {
            throw new MongoSessionException(
                    "동시 세션 수 제한을 초과했습니다. (최대: " + maxConcurrentSessions + ")",
                    MongoSessionException.SessionErrorType.SESSION_LIMIT_EXCEEDED
            );
        }

        // 새 세션 생성
        String sessionId = UlidCreator.getUlid().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(defaultSessionDurationHours);

        ContributorSessionDocument session = new ContributorSessionDocument(
                sessionId, application.getClientId(), userId, ipAddress, expiresAt
        );
        session.setUserAgent(userAgent);
        session.setSessionType("DIRECT_MONGODB");
        session.setPermissions(new String[]{"read", "write"});

        try {
            sessionRepository.save(session);
        } catch (Exception e) {
            throw new MongoSessionException(
                    "MongoDB 세션 생성에 실패했습니다: " + e.getMessage(),
                    sessionId,
                    MongoSessionException.SessionErrorType.SESSION_CREATION_FAILED
            );
        }

        // MongoDB Atlas 연결 정보 생성
        String mongoUsername = "contributor_" + application.getClientId();
        String mongoPassword = generateSecurePassword();
        String connectionString = generateAtlasConnectionString(mongoUsername, mongoPassword);

        return new MongoSessionInfoDto(
                sessionId,
                application.getClientId(),
                connectionString,
                mongoDatabase, // db_challenges
                mongoUsername,
                mongoPassword,
                session.getCreatedAt(),
                session.getExpiresAt(),
                session.getPermissions()
        );
    }

    @Transactional(readOnly = true)
    public List<ContributorSessionDto> getUserActiveSessions(String userId) {
        List<ContributorSessionDocument> sessions =
                sessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());

        return sessions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ContributorSessionDto getSessionInfo(String sessionId, String userId) {
        ContributorSessionDocument session = sessionRepository.findActiveSessionById(sessionId, LocalDateTime.now())
                .orElseThrow(() -> new MongoSessionException(
                        "활성 세션을 찾을 수 없습니다.",
                        sessionId,
                        MongoSessionException.SessionErrorType.SESSION_NOT_FOUND
                ));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenException("해당 세션에 대한 권한이 없습니다.");
        }

        return convertToDto(session);
    }

    public void deleteSession(String sessionId, String userId) {
        ContributorSessionDocument session = sessionRepository.findActiveSessionById(sessionId, LocalDateTime.now())
                .orElseThrow(() -> new MongoSessionException(
                        "활성 세션을 찾을 수 없습니다.",
                        sessionId,
                        MongoSessionException.SessionErrorType.SESSION_NOT_FOUND
                ));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenException("해당 세션에 대한 권한이 없습니다.");
        }

        session.setActive(false);
        sessionRepository.save(session);
    }

    public void deleteAllUserSessions(String userId) {
        List<ContributorSessionDocument> sessions =
                sessionRepository.findActiveSessionsByUserId(userId, LocalDateTime.now());

        sessions.forEach(session -> session.setActive(false));
        sessionRepository.saveAll(sessions);
    }

    public MongoSessionInfoDto extendSession(String sessionId, String userId, int additionalHours) {
        ContributorSessionDocument session = sessionRepository.findActiveSessionById(sessionId, LocalDateTime.now())
                .orElseThrow(() -> new MongoSessionException(
                        "활성 세션을 찾을 수 없습니다.",
                        sessionId,
                        MongoSessionException.SessionErrorType.SESSION_NOT_FOUND
                ));

        if (!session.getUserId().equals(userId)) {
            throw new ForbiddenException("해당 세션에 대한 권한이 없습니다.");
        }

        if (additionalHours > 72) {
            throw new MongoSessionException(
                    "세션은 최대 72시간까지만 연장할 수 있습니다.",
                    sessionId,
                    MongoSessionException.SessionErrorType.SESSION_EXTENSION_FAILED
            );
        }

        session.setExpiresAt(session.getExpiresAt().plusHours(additionalHours));
        session.setLastAccessedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // 기존 연결 정보 재생성
        String mongoUsername = "contributor_" + session.getClientId();
        String mongoPassword = generateSecurePassword();
        String connectionString = generateAtlasConnectionString(mongoUsername, mongoPassword);

        return new MongoSessionInfoDto(
                session.getSessionId(),
                session.getClientId(),
                connectionString,
                mongoDatabase,
                mongoUsername,
                mongoPassword,
                session.getCreatedAt(),
                session.getExpiresAt(),
                session.getPermissions()
        );
    }

    @Scheduled(fixedRateString = "${mongo.session.cleanup-interval-hours:1}000000") // 1시간마다
    public void cleanupExpiredSessions() {
        List<ContributorSessionDocument> expiredSessions =
                sessionRepository.findExpiredSessions(LocalDateTime.now());

        expiredSessions.forEach(session -> session.setActive(false));
        sessionRepository.saveAll(expiredSessions);

        if (!expiredSessions.isEmpty()) {
            System.out.println("정리된 만료 세션 수: " + expiredSessions.size());
        }
    }

    // Helper Methods
    private ContributorSessionDto convertToDto(ContributorSessionDocument session) {
        ContributorSessionDto dto = new ContributorSessionDto();
        dto.setSessionId(session.getSessionId());
        dto.setClientId(session.getClientId());
        dto.setIp(session.getIpAddress());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setExpiresAt(session.getExpiresAt());
        return dto;
    }

    /**
     * MongoDB Atlas 연결 문자열 생성
     * URI 템플릿에 username/password를 포맷팅하여 삽입
     */
    private String generateAtlasConnectionString(String username, String password) {
        return String.format(mongoUriTemplate, username, password);
    }

    private String generateSecurePassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 16; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }
}