package com.hotelreservation.service;

import com.hotelreservation.entity.AppUser;
import com.hotelreservation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<AppUser> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public AppUser createUser(AppUser user) {
        return userRepository.save(user);
    }

    public AppUser updateUser(Long id, AppUser userDetails) {
        AppUser user = userRepository.findById(id).orElseThrow();
        user.setEmail(userDetails.getEmail());
        user.setName(userDetails.getName());
        user.setRoles(userDetails.getRoles());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
