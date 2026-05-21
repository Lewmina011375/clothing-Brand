package com.onlinepharmacy.medicare.controller;

import com.onlinepharmacy.medicare.model.User;
import com.onlinepharmacy.medicare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public List<AdminUserDto> findAll() {
        return userRepository.findAll().stream()
                .map(u -> new AdminUserDto(u.getId(), u.getEmail(), u.getFullName(), u.getRole()))
                .toList();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<AdminUserDto> updateRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        return userRepository.findById(id)
                .map(user -> {
                    try {
                        if (request.role() != null) {
                            user.setRole(User.Role.valueOf(request.role().toUpperCase()));
                        }
                    } catch (IllegalArgumentException ignored) {
                        // keep previous role if invalid value
                    }
                    User saved = userRepository.save(user);
                    return ResponseEntity.ok(new AdminUserDto(saved.getId(), saved.getEmail(), saved.getFullName(), saved.getRole()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record AdminUserDto(Long id, String email, String fullName, User.Role role) {
    }

    public record RoleRequest(String role) {
    }
}

