package com.tubespbo.foodorder.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Customer extends User {
    @OneToMany
    private List<MenuItem> cart = new ArrayList<>();

    @Override
    public boolean login(String username, String password) {
        return username.equals(getUsername()) && password.equals(getPassword());
    }

    @Override
    public void logout() {
        System.out.println("Customer logged out.");
    }

    public void addToCart(MenuItem item) {
        cart.add(item);
    }

    public void removeFromCart(MenuItem item) {
        cart.remove(item);
    }

    public void clearCart() {
        cart.clear();
    }

    public List<MenuItem> getCart() { return cart; }
    public void setCart(List<MenuItem> cart) { this.cart = cart; }
}