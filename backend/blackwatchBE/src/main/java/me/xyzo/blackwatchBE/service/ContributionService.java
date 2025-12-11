package me.xyzo.blackwatchBE.service;

import com.github.f4b6a3.ulid.UlidCreator;
import me.xyzo.blackwatchBE.document.CredentialDocument;
import me.xyzo.blackwatchBE.domain.ClientSecret;
import me.xyzo.blackwatchBE.domain.ContributionApplication;
import me.xyzo.blackwatchBE.dto.*;
import me.xyzo.blackwatchBE.exception.BadRequestException;
import me.xyzo.blackwatchBE.exception.ForbiddenException;
import me.xyzo.blackwatchBE.exception.NotFoundException;
import me.xyzo.blackwatchBE.repository.ClientSecretRepository;
import me.xyzo.blackwatchBE.repository.ContributionApplicationRepository;
import me.xyzo.blackwatchBE.repository.CredentialDocumentRepository;
import me.xyzo.blackwatchBE.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ContributionService {

    @Autowired
    private ContributionApplicationRepository applicationRepository;

    @Autowired
    private ClientSecretRepository clientSecretRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoSessionService mongoSessionService;

    @Autowired
    private CredentialDocumentRepository credentialDocumentRepository;

    public ContributionApplicationResponseDto submitApplication(ContributionApplicationDto request) {
        String userId = getCurrentUserId();

        if (applicationRepository.existsById(userId)) {
            throw new BadRequestException("이미 기여자 신청을 하셨습니다.");
        }

        ContributionApplication application = new ContributionApplication();
        application.setUserId(userId);
        application.setContact(request.getContact());
        application.setHandle(request.getHandle());
        application.setJobs(request.getJobs());
        application.setMotivation(request.getMotivation());
        application.setLaw(request.isLaw());
        application.setLicense(request.isLicense());
        application.setStatus(ContributionApplication.Status.PENDING);

        application.setClientId(UUID.randomUUID().toString());

        applicationRepository.save(application);

        return new ContributionApplicationResponseDto(
                userId,
                "PENDING",
                application.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public ContributionApplicationStatusDto getMyApplicationStatus() {
        String userId = getCurrentUserId();

        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("기여자 신청을 찾을 수 없습니다."));

        ContributionApplicationStatusDto dto = new ContributionApplicationStatusDto();
        dto.setUserId(application.getUserId());
        dto.setClientId(application.getClientId());
        dto.setStatus(application.getStatus().name());
        dto.setJobs(application.getJobs());
        dto.setMotivation(application.getMotivation());
        dto.setCreatedAt(application.getCreatedAt());
        dto.setUpdatedAt(application.getUpdatedAt());

        return dto;
    }

    public ClientSecretResponseDto generateClientSecret() {
        String userId = getCurrentUserId();

        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new ForbiddenException("기여자 권한이 없습니다."));

        if (!application.getStatus().equals(ContributionApplication.Status.ACCEPT)) {
            throw new ForbiddenException("승인된 기여자만 Client Secret을 발급받을 수 있습니다.");
        }

        String clientId = application.getClientId();

        Optional<ClientSecret> existingSecret = clientSecretRepository.findById(clientId);
        if (existingSecret.isPresent() && existingSecret.get().getExpiresAt().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Secret이 만료되지 않았습니다.");
        }

        String newSecret = generateRandomSecret();

        int validDays = existingSecret.isEmpty() ? 3 : 7;
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(validDays);

        ClientSecret clientSecret = new ClientSecret(clientId, newSecret, expiresAt);
        clientSecretRepository.save(clientSecret);

        // MongoDB credential도 업데이트
        Optional<CredentialDocument> credentialOpt = credentialDocumentRepository.findByClientId(clientId);
        if (credentialOpt.isPresent()) {
            CredentialDocument credential = credentialOpt.get();
            credential.setClientSecret(newSecret);
            credentialDocumentRepository.save(credential);
        }

        return new ClientSecretResponseDto(
                clientId,
                newSecret,
                clientSecret.getCreatedAt(),
                expiresAt
        );
    }

    @Transactional(readOnly = true)
    public ContributorInfoDto getMyContributorInfo() {
        String userId = getCurrentUserId();

        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("기여자 정보를 찾을 수 없습니다."));

        ContributorInfoDto dto = new ContributorInfoDto();
        dto.setUserId(application.getUserId());
        dto.setClientId(application.getClientId());
        dto.setStatus(application.getStatus().name());

        Optional<ClientSecret> secret = clientSecretRepository.findById(application.getClientId());
        if (secret.isPresent()) {
            dto.setClientSecret(new ClientSecretInfoDto(
                    secret.get().getCreatedAt(),
                    secret.get().getExpiresAt()
            ));
        } else {
            if (application.getStatus().equals(ContributionApplication.Status.ACCEPT)) {
                throw new BadRequestException("Secret이 만료되지 않았습니다.");
            }
        }

        return dto;
    }

    public List<ContributorSessionDto> getSessions() {
        String userId = getCurrentUserId();
        return mongoSessionService.getUserActiveSessions(userId);
    }

    public void deleteSessions() {
        String userId = getCurrentUserId();
        mongoSessionService.deleteAllUserSessions(userId);
    }

    private String generateRandomSecret() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder secret = new StringBuilder();

        for (int i = 0; i < 32; i++) {
            secret.append(chars.charAt(random.nextInt(chars.length())));
        }

        return secret.toString();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}