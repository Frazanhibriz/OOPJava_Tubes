package com.tubespbo.foodorder.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.KeranjangItem;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;
import com.tubespbo.foodorder.repository.KeranjangItemRepository;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.repository.OrderRepository;
import com.tubespbo.foodorder.security.CustomUserDetails;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/cart")
public class KeranjangController {

    @Autowired
    private KeranjangItemRepository keranjangItemRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestParam int menuItemId, @RequestParam int quantity, Authentication auth) {
        if (quantity <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be at least 1");
        }

        Customer customer = (Customer) ((CustomUserDetails) auth.getPrincipal()).getUser();
        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(menuItemId);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Menu item not found");
        }

        MenuItem menuItem = menuItemOpt.get();
        Optional<KeranjangItem> existingItemOpt = keranjangItemRepository.findByCustomerAndMenuItem(customer, menuItem);

        if (existingItemOpt.isPresent()) {
            KeranjangItem item = existingItemOpt.get();
            item.setQuantity(quantity); 
            keranjangItemRepository.save(item);
        } else {
            KeranjangItem newItem = new KeranjangItem();
            newItem.setMenuItem(menuItem);
            newItem.setQuantity(quantity);
            newItem.setCustomer(customer);
            keranjangItemRepository.save(newItem);
        }
        return ResponseEntity.ok("Item quantity updated in cart");
    }

    @GetMapping
    public ResponseEntity<?> viewCart(Authentication auth) {
        Customer customer = (Customer) ((CustomUserDetails) auth.getPrincipal()).getUser();
        List<KeranjangItem> cartItems = keranjangItemRepository.findByCustomer(customer);
        List<Map<String, Object>> itemDetails = new ArrayList<>();

        for (KeranjangItem item : cartItems) {
            Map<String, Object> itemMap = new HashMap<>();
            MenuItem menuItem = item.getMenuItem(); 

            itemMap.put("menuId", menuItem.getMenuId());
            itemMap.put("name", menuItem.getName());
            itemMap.put("description", menuItem.getDescription());
            itemMap.put("price", menuItem.getPrice()); 
            itemMap.put("category", menuItem.getCategory());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("subtotal", menuItem.getPrice() * item.getQuantity()); 
            itemMap.put("imageUrl", menuItem.getImageUrl()); 
            itemDetails.add(itemMap);
        }
        return ResponseEntity.ok(itemDetails);
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeItem(@RequestParam int menuItemId, Authentication auth) {
        Customer customer = (Customer) ((CustomUserDetails) auth.getPrincipal()).getUser();
        Optional<MenuItem> menuItemOpt = menuItemRepository.findById(menuItemId);
        if (menuItemOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Menu item not found");
        }

        MenuItem menuItem = menuItemOpt.get();
        Optional<KeranjangItem> keranjangItemOpt = keranjangItemRepository.findByCustomerAndMenuItem(customer, menuItem);

        if (keranjangItemOpt.isPresent()) {
            keranjangItemRepository.delete(keranjangItemOpt.get());
            return ResponseEntity.ok("Item removed from cart");
        } else {
            return ResponseEntity.status(404).body("Item not found in cart");
        }
    }

    @PostMapping("/checkout")
    @Transactional
    public ResponseEntity<?> checkout(@RequestParam int tableNumber, Authentication auth) {
        Customer customer = (Customer) ((CustomUserDetails) auth.getPrincipal()).getUser();
        List<KeranjangItem> cartItems = keranjangItemRepository.findByCustomer(customer);

        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        double totalOrderPrice = 0.0;
        List<Map<String, Object>> orderItemDetailsResponse = new ArrayList<>(); 
        List<MenuItem> orderedMenuItemsForOrderEntity = new ArrayList<>(); 

        for (KeranjangItem cartItem : cartItems) {
            MenuItem menuItem = cartItem.getMenuItem();
            int quantity = cartItem.getQuantity();
            double itemSubtotal = menuItem.getPrice() * quantity;
            
            Map<String, Object> itemDetailMap = new HashMap<>();
            itemDetailMap.put("menuId", menuItem.getMenuId());
            itemDetailMap.put("name", menuItem.getName());
            itemDetailMap.put("price", menuItem.getPrice()); 
            itemDetailMap.put("category", menuItem.getCategory());
            itemDetailMap.put("quantity", quantity);
            itemDetailMap.put("subtotal", itemSubtotal);
            itemDetailMap.put("imageUrl", menuItem.getImageUrl()); 
            orderItemDetailsResponse.add(itemDetailMap);

            totalOrderPrice += itemSubtotal;

            for (int i = 0; i < quantity; i++) {
                orderedMenuItemsForOrderEntity.add(menuItem);
            }
        }

        Order order = new Order();
        order.setCustomer(customer);
        order.setTableNumber(tableNumber);
        order.setStatus(Order.STATUS_CONFIRMED); 
        order.setPaymentStatus(Order.DEFAULT_STATUS_PAYMENT); 
        order.setQueueNumber((int) (orderRepository.count() + 1)); 
        order.setTotalPrice(totalOrderPrice);
        order.setItems(orderedMenuItemsForOrderEntity); 

        Order savedOrder = orderRepository.save(order);
        
        keranjangItemRepository.deleteByCustomer(customer);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", savedOrder.getOrderId());
        response.put("customerName", customer.getName()); 
        response.put("tableNumber", savedOrder.getTableNumber());
        response.put("items", orderItemDetailsResponse); 
        response.put("paymentStatus", savedOrder.getPaymentStatus());
        response.put("queueNumber", savedOrder.getQueueNumber());
        response.put("status", savedOrder.getStatus());
        response.put("totalPrice", savedOrder.getTotalPrice());

        return ResponseEntity.ok(response);
    }
}