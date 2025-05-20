package com.tubespbo.foodorder.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tubespbo.foodorder.dto.OrderRequest;
import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.security.CustomUserDetails;
import com.tubespbo.foodorder.service.OrderService;

@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    // Create new order
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest,
                                         Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.getUser().getRole().equalsIgnoreCase("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only customers can create orders.");
        }

        Customer customer = (Customer) userDetails.getUser();
        List<Integer> itemIds = orderRequest.getItems();

        if (itemIds == null || itemIds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Items list cannot be empty.");
        }

        List<MenuItem> items = menuItemRepository.findAllById(itemIds);

        if (items.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No menu items found for the provided IDs.");
        }

        if (items.size() != itemIds.size()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Some menu items not found. Please verify the IDs.");
        }

        Order order = orderService.createOrder(customer, items, orderRequest.getTableNumber());
        return ResponseEntity.ok(order);
    }

    // Get all orders - ADMIN only
    @GetMapping
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.getUser().getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admins can access all orders.");
        }

        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    // Update order status - ADMIN only
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable int id,
                                               @RequestBody String newStatus,
                                               Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.getUser().getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only admins can update order status.");
        }

        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Order not found.");
        }

        List<String> allowedStatuses = List.of(
            Order.STATUS_CONFIRMED,
            Order.STATUS_IN_QUEUE,
            Order.STATUS_IN_PROGRESS,
            Order.STATUS_DELIVERED
        );

        if (!allowedStatuses.contains(newStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid status. Allowed: " + allowedStatuses);
        }

        orderService.updateOrderStatus(id, newStatus);
        return ResponseEntity.ok("Order status updated to: " + newStatus);
    }

    // Get my orders - CUSTOMER only
    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.getUser().getRole().equalsIgnoreCase("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only customers can view their orders.");
        }

        Customer customer = (Customer) userDetails.getUser();
        List<Order> myOrders = orderService.getOrdersByCustomer(customer);
        return ResponseEntity.ok(myOrders);
    }
}
