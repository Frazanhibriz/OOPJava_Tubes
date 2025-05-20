package com.tubespbo.foodorder.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.tubespbo.foodorder.model.Admin;
import com.tubespbo.foodorder.repository.UserRepository;

@Configuration
public class InsertAdminRunner {

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner createAdmin(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                Admin admin = new Admin();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("ngokadmin"));
                admin.setName("Administrator");
                admin.setNoTelp("081234567890");
                admin.setRole("ADMIN");

                userRepository.save(admin);
                System.out.println("Default admin user created.");
            } else {
                System.out.println("Admin user already exists.");
            }
        };
    }
} 
