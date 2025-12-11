package me.xyzo.blackwatchBE.service;

import com.github.f4b6a3.ulid.UlidCreator;
import me.xyzo.blackwatchBE.config.JwtUtil;
import me.xyzo.blackwatchBE.domain.User;
import me.xyzo.blackwatchBE.dto.*;
import me.xyzo.blackwatchBE.exception.BadRequestException;
import me.xyzo.blackwatchBE.exception.ConflictException;
import me.xyzo.blackwatchBE.exception.NotFoundException;
import me.xyzo.blackwatchBE.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Transactional
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private EmailService emailService;

    // 임시 저장소 (실제로는 Redis나 DB를 사용해야 함)
    private final ConcurrentHashMap<String, String> verificationCodes = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, LocalDateTime> codeExpirations = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> mfaSessions = new ConcurrentHashMap<>();

    public void sendSignupVerificationCode(String email) {
        // 이미 가입된 이메일 체크
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("이미 사용중인 이메일입니다");
        }

        // 5분 이내 재요청 체크
        LocalDateTime lastSent = codeExpirations.get(email);
        if (lastSent != null && lastSent.plusMinutes(5).isAfter(LocalDateTime.now())) {
            throw new BadRequestException("이미 인증 번호가 전송되었습니다. 5분 후 다시 시도해주세요.");
        }

        String code = generateVerificationCode();
        verificationCodes.put(email, code);
        codeExpirations.put(email, LocalDateTime.now().plusMinutes(10));

        emailService.sendVerificationCode(email, code);
    }

    public void verifySignupAndCreateAccount(SignupVerifyDto request) {
        // 코드 검증
        String storedCode = verificationCodes.get(request.getEmail());
        LocalDateTime expiration = codeExpirations.get(request.getEmail());

        if (storedCode == null || !storedCode.equals(request.getCode()) ||
                expiration == null || expiration.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("번호가 일치하지 않거나 만료되었습니다.");
        }

        // 중복 체크
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("이미 사용중인 이메일입니다");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("이미 사용중인 username입니다.");
        }

        // 계정 생성
        User user = new User();
        user.setUserId(UlidCreator.getUlid().toString());
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmailVerified(true);
        user.setRoles(Set.of(User.Role.USER));

        userRepository.save(user);

        // 코드 정리
        verificationCodes.remove(request.getEmail());
        codeExpirations.remove(request.getEmail());
    }

    public ResponseEntity<?> signin(SigninRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("이메일 또는 비밀번호가 일치하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        // 마지막 로그인 시간 업데이트
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        if (user.isMfaEnabled()) {
            // MFA 활성 - 세션키 생성 및 코드 발송
            String sessionKey = UlidCreator.getUlid().toString();
            mfaSessions.put(sessionKey, user.getUserId());

            String code = generateVerificationCode();
            verificationCodes.put(user.getEmail(), code);
            codeExpirations.put(user.getEmail(), LocalDateTime.now().plusMinutes(10));

            emailService.sendVerificationCode(user.getEmail(), code);

            return ResponseEntity.ok(new MfaResponseDto(sessionKey, true, "이메일로 인증번호가 전송되었습니다."));
        } else {
            // MFA 비활성 - 바로 토큰 발급
            String role = user.getRoles().contains(User.Role.ADMIN) ? "ADMIN" :
                    user.getRoles().contains(User.Role.CONTRIBUTOR) ? "CONTRIBUTOR" : "USER";

            String token = jwtUtil.generateToken(user.getUserId(), role);
            String expiresAt = jwtUtil.getExpirationFromToken(token)
                    .toInstant().toString();

            return ResponseEntity.ok(new SigninResponseDto(token, expiresAt, role));
        }
    }

    public SigninResponseDto verifyMfa(MfaVerifyDto request) {
        String userId = mfaSessions.get(request.getSessionKey());
        if (userId == null) {
            throw new BadRequestException("코드가 일치하지 않거나 만료되었습니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        String storedCode = verificationCodes.get(user.getEmail());
        LocalDateTime expiration = codeExpirations.get(user.getEmail());

        if (storedCode == null || !storedCode.equals(request.getCode()) ||
                expiration == null || expiration.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("코드가 일치하지 않거나 만료되었습니다.");
        }

        // 토큰 발급
        String role = user.getRoles().contains(User.Role.ADMIN) ? "ADMIN" :
                user.getRoles().contains(User.Role.CONTRIBUTOR) ? "CONTRIBUTOR" : "USER";

        String token = jwtUtil.generateToken(user.getUserId(), role);
        String expiresAt = jwtUtil.getExpirationFromToken(token)
                .toInstant().toString();

        // 정리
        mfaSessions.remove(request.getSessionKey());
        verificationCodes.remove(user.getEmail());
        codeExpirations.remove(user.getEmail());

        return new SigninResponseDto(token, expiresAt, role);
    }

    public MfaResponseDto resendMfaCode(String sessionKey) {
        String userId = mfaSessions.get(sessionKey);
        if (userId == null) {
            throw new BadRequestException("유효하지 않은 세션입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        String newSessionKey = UlidCreator.getUlid().toString();
        mfaSessions.remove(sessionKey);
        mfaSessions.put(newSessionKey, userId);

        String code = generateVerificationCode();
        verificationCodes.put(user.getEmail(), code);
        codeExpirations.put(user.getEmail(), LocalDateTime.now().plusMinutes(10));

        emailService.sendVerificationCode(user.getEmail(), code);

        return new MfaResponseDto(newSessionKey, true, "이메일로 인증코드가 전송되었습니다.");
    }

    public void enableMfa() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (user.isMfaEnabled()) {
            throw new BadRequestException("다단계 인증을 사용중입니다.");
        }

        user.setMfaEnabled(true);
        userRepository.save(user);
    }

    public void disableMfa() {
        String userId = getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        if (!user.isMfaEnabled()) {
            throw new BadRequestException("다단계 인증을 사용중이 아닙니다.");
        }

        // 기여자는 MFA 비활성화 금지
        if (user.getRoles().contains(User.Role.CONTRIBUTOR)) {
            throw new BadRequestException("기여자는 다단계 인증을 비활성화할 수 없습니다.");
        }

        user.setMfaEnabled(false);
        userRepository.save(user);
    }

    public void sendResetPasswordCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("존재하지 않는 이메일입니다."));

        // 5분 이내 재요청 체크
        LocalDateTime lastSent = codeExpirations.get(email);
        if (lastSent != null && lastSent.plusMinutes(5).isAfter(LocalDateTime.now())) {
            throw new BadRequestException("이미 인증 번호가 전송되었습니다. 5분 후 다시 시도해주세요.");
        }

        String code = generateVerificationCode();
        verificationCodes.put(email, code);
        codeExpirations.put(email, LocalDateTime.now().plusMinutes(10));

        emailService.sendVerificationCode(email, code);
    }

    public void confirmResetPassword(ResetPasswordConfirmDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("존재하지 않는 이메일입니다."));

        String storedCode = verificationCodes.get(request.getEmail());
        LocalDateTime expiration = codeExpirations.get(request.getEmail());

        if (storedCode == null || !storedCode.equals(request.getCode()) ||
                expiration == null || expiration.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("인증 번호가 일치하지 않거나 만료되었습니다.");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // 코드 정리
        verificationCodes.remove(request.getEmail());
        codeExpirations.remove(request.getEmail());
    }

    private String generateVerificationCode() {
        return String.format("%06d", (int)(Math.random() * 1000000));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
