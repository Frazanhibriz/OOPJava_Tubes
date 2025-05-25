package com.tubespbo.foodorder.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.KeranjangItem;
import com.tubespbo.foodorder.model.MenuItem;

@Repository
public interface KeranjangItemRepository extends JpaRepository<KeranjangItem, Long> {
    List<KeranjangItem> findByCustomer(Customer customer);
    Optional<KeranjangItem> findByCustomerAndMenuItem(Customer customer, MenuItem menuItem);
    void deleteByCustomer(Customer customer);
} 
