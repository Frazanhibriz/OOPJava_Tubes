package com.tubespbo.foodorder.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Ditambahkan
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
import com.tubespbo.foodorder.repository.OrderRepository; // Ditambahkan untuk count
import com.tubespbo.foodorder.security.CustomUserDetails;
import com.tubespbo.foodorder.service.OrderService;


@RestController
@RequestMapping("/order")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired // Ditambahkan untuk akses langsung ke repository untuk count
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (!userDetails.getUser().getRole().equalsIgnoreCase("CUSTOMER")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only customers can create orders.");
        }

        Customer customer = (Customer) userDetails.getUser();
        List<Integer> itemIds = orderRequest.getItems();

        if (itemIds == null || itemIds.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Items list cannot be empty.");
        }

        Map<Integer, Integer> quantityMap = new HashMap<>();
        for (Integer id : itemIds) {
            quantityMap.put(id, quantityMap.getOrDefault(id, 0) + 1);
        }

        List<MenuItem> menuItemsFromDb = menuItemRepository.findAllById(new ArrayList<>(quantityMap.keySet()));
        
        if (menuItemsFromDb.size() != quantityMap.size()) {
            List<Integer> foundIds = menuItemsFromDb.stream().map(MenuItem::getMenuId).collect(Collectors.toList());
            List<Integer> notFoundIds = new ArrayList<>(quantityMap.keySet());
            notFoundIds.removeAll(foundIds);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Some menu items not found. Please verify the IDs: " + notFoundIds);
        }

        List<MenuItem> orderedItemsForEntity = new ArrayList<>();
        for (MenuItem item : menuItemsFromDb) {
            int qty = quantityMap.get(item.getMenuId());
            for (int i = 0; i < qty; i++) {
                orderedItemsForEntity.add(item);
            }
        }

        Order order = orderService.createOrder(customer, orderedItemsForEntity, orderRequest.getTableNumber());
        return ResponseEntity.ok(buildOrderResponse(order));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Pastikan getAllOrders hanya untuk Admin
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        List<Order> orders = orderService.getAllOrders();
        List<Map<String, Object>> response = orders.stream().map(this::buildOrderResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')") // Pastikan update status hanya untuk Admin
    public ResponseEntity<?> updateOrderStatus(@PathVariable int id, @RequestBody String newStatus, Authentication authentication) {
        Order order = orderService.getOrderById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Order not found.");
        }

        String cleanedStatus = newStatus.replace("\"", "").toUpperCase();

        List<String> allowedStatuses = List.of(
                Order.STATUS_CONFIRMED,
                Order.STATUS_IN_QUEUE,
                Order.STATUS_IN_PROGRESS,
                Order.STATUS_DELIVERED
        );

        if (!allowedStatuses.contains(cleanedStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status: '" + cleanedStatus + "'. Allowed: " + allowedStatuses);
        }

        orderService.updateOrderStatus(id, cleanedStatus);
        return ResponseEntity.ok("Order status updated to: " + cleanedStatus);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Customer customer = (Customer) userDetails.getUser();
        List<Order> myOrders = orderService.getOrdersByCustomer(customer);
        List<Map<String, Object>> response = myOrders.stream().map(this::buildOrderResponse).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> buildOrderResponse(Order order) {
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getOrderId());
        
        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("id", order.getCustomer().getId());
        customerDetails.put("name", order.getCustomer().getName());
        customerDetails.put("username", order.getCustomer().getUsername());
        response.put("customer", customerDetails);

        response.put("tableNumber", order.getTableNumber());
        response.put("status", order.getStatus());
        response.put("paymentStatus", order.getPaymentStatus());
        response.put("queueNumber", order.getQueueNumber());
        response.put("totalPrice", order.getTotalPrice());

        Map<Integer, Integer> quantityMap = new HashMap<>();
        if (order.getItems() != null) {
            for (MenuItem item : order.getItems()) {
                quantityMap.put(item.getMenuId(), quantityMap.getOrDefault(item.getMenuId(), 0) + 1);
            }
        }
        
        Map<Integer, MenuItem> itemLookup = new HashMap<>();
        if (order.getItems() != null) {
            itemLookup = order.getItems().stream()
                .collect(Collectors.toMap(MenuItem::getMenuId, item -> item, (existing, replacement) -> existing));
        }

        List<Map<String, Object>> itemDetails = new ArrayList<>();
        for (Map.Entry<Integer, Integer> entry : quantityMap.entrySet()) {
            MenuItem item = itemLookup.get(entry.getKey());
            if (item != null) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("menuId", item.getMenuId());
                detail.put("name", item.getName());
                detail.put("description", item.getDescription());
                detail.put("category", item.getCategory());
                detail.put("quantity", entry.getValue());
                detail.put("price", item.getPrice() * entry.getValue());
                detail.put("unitPrice", item.getPrice()); 
                detail.put("imageUrl", item.getImageUrl());
                itemDetails.add(detail);
            }
        }

        response.put("items", itemDetails);
        return response;
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getOrderCount() {
        long count = orderRepository.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}