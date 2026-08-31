package com.melofine.service;

import com.melofine.dto.*;
import com.melofine.model.OtpVerification;
import com.melofine.model.User;
import com.melofine.repository.OtpVerificationRepository;
import com.melofine.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OtpVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Generates a 6-digit random OTP, BCrypt-hashes it, stores it in PostgreSQL,
     * and emails the plain OTP to the user.
     */
    @Transactional
    public ApiResponse<String> sendSignupOtp(String email) {
        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ApiResponse.error("An account with this email already exists. Please sign in.");
        }

        // Generate cryptographically secure 6-digit OTP
        int code = 100000 + secureRandom.nextInt(900000);
        String plainOtp = String.valueOf(code);

        // Hash the OTP with BCrypt before storing in PostgreSQL
        String hashedOtp = passwordEncoder.encode(plainOtp);

        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        OtpVerification otpVerification = otpVerificationRepository.findByEmail(normalizedEmail)
                .orElse(OtpVerification.builder().email(normalizedEmail).build());

        otpVerification.setOtpHash(hashedOtp);
        otpVerification.setExpiresAt(expiresAt);
        otpVerification.setVerified(false);
        otpVerification.setCreatedAt(LocalDateTime.now());

        otpVerificationRepository.save(otpVerification);

        // Log OTP clearly in console for easy testing
        log.info("==================================================================");
        log.info("🔐 [OTP DISPATCH] Recipient: {} | VERIFICATION CODE: {}", normalizedEmail, plainOtp);
        log.info("==================================================================");

        // Send HTML email with OTP
        emailService.sendOtpEmail(normalizedEmail, plainOtp);

        return ApiResponse.ok("Verification code sent to " + normalizedEmail + ". Please check your Primary Inbox or Spam folder.");
    }

    /**
     * Verifies the BCrypt OTP and creates the new user with BCrypt hashed password in PostgreSQL.
     */
    @Transactional
    public ApiResponse<UserResponse> verifyAndRegister(RegisterRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();
        String username = req.getUsername().trim();

        if (userRepository.existsByEmail(normalizedEmail)) {
            return ApiResponse.error("Email is already registered.");
        }

        if (userRepository.existsByUsername(username)) {
            return ApiResponse.error("Username is already taken. Please choose another.");
        }

        // Verify OTP from PostgreSQL
        OtpVerification otpRecord = otpVerificationRepository.findByEmail(normalizedEmail)
                .orElse(null);

        if (otpRecord == null) {
            return ApiResponse.error("No OTP request found for this email. Please request a new code.");
        }

        if (otpRecord.getExpiresAt().isBefore(LocalDateTime.now())) {
            return ApiResponse.error("Verification code has expired. Please request a new one.");
        }

        // Check if OTP matches using BCrypt verify
        boolean otpMatches = passwordEncoder.matches(req.getOtp().trim(), otpRecord.getOtpHash());
        if (!otpMatches) {
            return ApiResponse.error("Invalid verification code. Please check and try again.");
        }

        // OTP is verified! Save new user with BCrypt-hashed password
        String hashedPassword = passwordEncoder.encode(req.getPassword());
        User newUser = User.builder()
                .username(username)
                .email(normalizedEmail)
                .passwordHash(hashedPassword)
                .build();

        userRepository.save(newUser);

        // Cleanup the OTP record
        otpVerificationRepository.delete(otpRecord);

        UserResponse userResponse = UserResponse.builder()
                .id(newUser.getId())
                .username(newUser.getUsername())
                .email(newUser.getEmail())
                .build();

        return ApiResponse.ok("Account created successfully! Welcome to Melo-Fine.", userResponse);
    }

    /**
     * Signs in an existing user using BCrypt verification,
     * and sends a warm greeting welcome-back email from rannavin72@gmail.com.
     */
    public ApiResponse<UserResponse> login(LoginRequest req) {
        String normalizedEmail = req.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        if (user == null) {
            return ApiResponse.error("Invalid email or password.");
        }

        boolean passwordMatches = passwordEncoder.matches(req.getPassword(), user.getPasswordHash());
        if (!passwordMatches) {
            return ApiResponse.error("Invalid email or password.");
        }

        // Send greeting welcome email asynchronously on sign-in
        emailService.sendWelcomeGreetingEmail(user.getEmail(), user.getUsername());

        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();

        return ApiResponse.ok("Signed in successfully. Welcome back, " + user.getUsername() + "!", userResponse);
    }
}
