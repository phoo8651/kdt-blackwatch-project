package me.xyzo.blackwatchBE.service;

import me.xyzo.blackwatchBE.document.CredentialDocument;
import me.xyzo.blackwatchBE.domain.ContributionApplication;
import me.xyzo.blackwatchBE.domain.User;
import me.xyzo.blackwatchBE.dto.ContributionApplicationStatusDto;
import me.xyzo.blackwatchBE.exception.NotFoundException;
import me.xyzo.blackwatchBE.repository.ContributionApplicationRepository;
import me.xyzo.blackwatchBE.repository.CredentialDocumentRepository;
import me.xyzo.blackwatchBE.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    @Autowired
    private ContributionApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CredentialDocumentRepository credentialDocumentRepository;

    @Transactional(readOnly = true)
    public List<ContributionApplicationStatusDto> getAllApplications() {
        List<ContributionApplication> applications = applicationRepository.findAll();
        return applications.stream()
                .map(this::convertToStatusDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContributionApplicationStatusDto> getPendingApplications() {
        List<ContributionApplication> applications = applicationRepository.findByStatus(ContributionApplication.Status.PENDING);
        return applications.stream()
                .map(this::convertToStatusDto)
                .collect(Collectors.toList());
    }

    public void approveApplication(String userId) {
        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("기여자 신청을 찾을 수 없습니다."));

        application.setStatus(ContributionApplication.Status.ACCEPT);
        applicationRepository.save(application);

        // 사용자에게 CONTRIBUTOR 역할 추가
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Set<User.Role> roles = user.getRoles();
        roles.add(User.Role.CONTRIBUTOR);
        user.setRoles(roles);

        // MFA 강제 활성화
        user.setMfaEnabled(true);

        userRepository.save(user);

        // MongoDB에 credential 저장
        String clientSecret = generateRandomSecret();
        CredentialDocument credential = new CredentialDocument(userId, application.getClientId(), clientSecret);
        credentialDocumentRepository.save(credential);
    }

    public void denyApplication(String userId) {
        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("기여자 신청을 찾을 수 없습니다."));

        application.setStatus(ContributionApplication.Status.DENIED);
        applicationRepository.save(application);

        // 사용자에게서 CONTRIBUTOR 역할 제거 (있다면)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Set<User.Role> roles = user.getRoles();
        roles.remove(User.Role.CONTRIBUTOR);
        user.setRoles(roles);
        userRepository.save(user);

        // MongoDB에서 credential 제거 (있다면)
        credentialDocumentRepository.deleteByClientId(application.getClientId());
    }

    public void resetApplicationToPending(String userId) {
        ContributionApplication application = applicationRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("기여자 신청을 찾을 수 없습니다."));

        application.setStatus(ContributionApplication.Status.PENDING);
        applicationRepository.save(application);

        // 사용자에게서 CONTRIBUTOR 역할 제거 (있다면)
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Set<User.Role> roles = user.getRoles();
        roles.remove(User.Role.CONTRIBUTOR);
        user.setRoles(roles);
        userRepository.save(user);

        // MongoDB에서 credential 제거 (있다면)
        credentialDocumentRepository.deleteByClientId(application.getClientId());
    }

    private ContributionApplicationStatusDto convertToStatusDto(ContributionApplication application) {
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

    private String generateRandomSecret() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder secret = new StringBuilder();

        for (int i = 0; i < 32; i++) {
            secret.append(chars.charAt(random.nextInt(chars.length())));
        }

        return secret.toString();
    }
}