package com.tubespbo.foodorder.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;

@Entity
public class Customer extends User {

    @OneToMany(mappedBy = "customer", cascade = jakarta.persistence.CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<KeranjangItem> keranjangItems = new ArrayList<>();

    public Customer() {
        super();
    }

    @Override
    public boolean login(String username, String password) {
        return username.equals(getUsername()) && password.equals(getPassword());
    }

    @Override
    public void logout() {
        System.out.println("Customer logged out.");
    }

    public List<KeranjangItem> getKeranjangItems() {
        return keranjangItems;
    }

    public void setKeranjangItems(List<KeranjangItem> keranjangItems) {
        this.keranjangItems = keranjangItems;
    }

    public void addToKeranjang(KeranjangItem item) {
        keranjangItems.add(item);
    }

    public void removeFromKeranjang(KeranjangItem item) {
        keranjangItems.remove(item);
    }

    public void clearKeranjang() {
        keranjangItems.clear();
    }
} 