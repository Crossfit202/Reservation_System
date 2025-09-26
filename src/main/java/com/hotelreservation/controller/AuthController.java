package com.hotelreservation.controller;

import com.hotelreservation.dto.LoginRequest;
import com.hotelreservation.dto.RegisterRequest;
import com.hotelreservation.entity.AppUser;
import com.hotelreservation.entity.Role;
import com.hotelreservation.repository.RoleRepository;
import com.hotelreservation.repository.UserRepository;
import com.hotelreservation.service.UserService;
import com.hotelreservation.util.JwtUtil;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil; // You need to implement JwtUtil for token generation

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        AppUser user = userRepository.findByEmail(request.email)
                .orElse(null);
        if (user == null || !passwordEncoder.matches(request.password, user.getPassword())) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user); // Generate JWT token
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        AppUser user = new AppUser();
        user.setEmail(request.email);
        user.setPassword(request.password);
        user.setName(request.name);

        // Assign default USER role
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("USER role not found"));
        user.setRoles(Set.of(userRole));

        userService.createUser(user);
        return ResponseEntity.ok("User registered successfully");
    }
}