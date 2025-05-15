package com.tubespbo.foodorder.model;

import jakarta.persistence.Entity;

@Entity
public class Admin extends User {
    @Override
    public boolean login(String username, String password) {
        return username.equals(getUsername()) && password.equals(getPassword());
    }

    @Override
    public void logout() {
        System.out.println("Admin logged out.");
    }
}