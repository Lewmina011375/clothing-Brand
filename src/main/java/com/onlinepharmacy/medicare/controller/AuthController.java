package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.User;
import com.onlinepharmacy.medicare.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!userService.matchesPassword(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return ResponseEntity.ok(Map.of(
                "token", String.valueOf(user.getId()),
                "email", user.getEmail(),
                "user", Map.of("id", user.getId(), "email", user.getEmail(), "fullName", user.getFullName(), "role", user.getRole().name())
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        User.Role role = User.Role.USER;
        if (request.role() != null && !request.role().isBlank()) {
            try {
                role = User.Role.valueOf(request.role().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                role = User.Role.USER;
            }
        }

        User user = User.builder()
                .email(request.email())
                .password(request.password())
                .fullName(request.fullName())
                .role(role)
                .build();
        User created = userService.create(user);
        return ResponseEntity.ok(Map.of(
                "token", String.valueOf(created.getId()),
                "email", created.getEmail(),
                "user", Map.of("id", created.getId(), "email", created.getEmail(), "fullName", created.getFullName(), "role", created.getRole().name())
        ));
    }

    @PostMapping("/seed-admin")
    public ResponseEntity<Map<String, String>> seedAdmin() {
        if (userService.existsByEmail("admin@medicare.com")) {
            return ResponseEntity.ok(Map.of("message", "Admin exists. Login: admin@medicare.com / admin123"));
        }
        User admin = User.builder()
                .email("admin@medicare.com")
                .password("admin123")
                .fullName("Admin")
                .role(User.Role.ADMIN)
                .build();
        userService.create(admin);
        return ResponseEntity.ok(Map.of("message", "Admin created. Login: admin@medicare.com / admin123"));
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String password) {}
    public record RegisterRequest(@NotBlank String email, @NotBlank String password, @NotBlank String fullName, String role) {}
}
