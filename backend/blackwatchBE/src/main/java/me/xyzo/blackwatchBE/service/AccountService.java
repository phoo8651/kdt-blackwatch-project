package me.xyzo.blackwatchBE.service;

import me.xyzo.blackwatchBE.domain.User;
import me.xyzo.blackwatchBE.dto.AccountUpdateDto;
import me.xyzo.blackwatchBE.dto.UserProfileDto;
import me.xyzo.blackwatchBE.exception.ConflictException;
import me.xyzo.blackwatchBE.exception.NotFoundException;
import me.xyzo.blackwatchBE.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@Transactional
public class AccountService {

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getMyAccount() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        return convertToUserProfileDto(user, true); // 본인 정보는 모든 필드 포함
    }

    public UserProfileDto updateMyAccount(AccountUpdateDto request) {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        // username 중복 체크
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new ConflictException("이미 사용중인 username입니다.");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getLocale() != null) {
            user.setLocale(request.getLocale());
        }

        if (request.getTimeZone() != null) {
            user.setTimeZone(request.getTimeZone());
        }

        userRepository.save(user);
        return convertToUserProfileDto(user, true);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        return convertToUserProfileDto(user, false); // 다른 사람 정보는 제한된 필드만
    }

    private UserProfileDto convertToUserProfileDto(User user, boolean includePrivateInfo) {
        UserProfileDto dto = new UserProfileDto();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setLocale(user.getLocale());
        dto.setTimeZone(user.getTimeZone());

        if (includePrivateInfo) {
            // 본인 정보인 경우 모든 정보 포함
            dto.setEmail(user.getEmail());
            dto.setEmailVerified(user.isEmailVerified());
            dto.setMfaEnabled(user.isMfaEnabled());
            dto.setRoles(user.getRoles().stream()
                    .map(Enum::name)
                    .collect(Collectors.toList()));
            dto.setCreatedAt(user.getCreatedAt());
            dto.setUpdatedAt(user.getUpdatedAt());
            dto.setLastLoginAt(user.getLastLoginAt());
        } else {
            // 다른 사람 정보인 경우 공개 정보만
            // displayName은 username과 동일하게 처리
        }

        return dto;
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}