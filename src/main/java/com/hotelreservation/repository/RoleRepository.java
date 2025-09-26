package com.hotelreservation.repository;

import com.hotelreservation.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional; // <-- Add this import

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
