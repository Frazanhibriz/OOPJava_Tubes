package com.tubespbo.foodorder.service;

import java.util.List;

import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;

public interface OrderService {
    Order createOrder(Customer customer, List<MenuItem> items);
    Order getOrderById(int id);
    void updateOrderStatus(int id, String status);
}
