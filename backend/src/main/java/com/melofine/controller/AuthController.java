package com.melofine.controller;

import com.melofine.dto.*;
import com.melofine.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-signup-otp")
    public ResponseEntity<ApiResponse<String>> sendSignupOtp(@Valid @RequestBody SendOtpRequest req) {
        ApiResponse<String> response = authService.sendSignupOtp(req.getEmail());
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-and-register")
    public ResponseEntity<ApiResponse<UserResponse>> verifyAndRegister(@Valid @RequestBody RegisterRequest req) {
        ApiResponse<UserResponse> response = authService.verifyAndRegister(req);
        if (!response.isSuccess()) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(@Valid @RequestBody LoginRequest req) {
        ApiResponse<UserResponse> response = authService.login(req);
        if (!response.isSuccess()) {
            return ResponseEntity.status(401).body(response);
        }
        return ResponseEntity.ok(response);
    }
}
