package com.tubespbo.foodorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.KeranjangItem;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;
import com.tubespbo.foodorder.repository.KeranjangItemRepository;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.repository.OrderRepository;
import com.tubespbo.foodorder.security.CustomUserDetails;
import com.tubespbo.foodorder.security.CustomUserDetailsService;
import com.tubespbo.foodorder.security.JwtUtil;
import com.tubespbo.foodorder.security.SecurityConfig;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication; // <-- IMPORT INI
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(KeranjangController.class)
@Import(SecurityConfig.class)
public class KeranjangControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KeranjangItemRepository keranjangItemRepository;

    @MockBean
    private MenuItemRepository menuItemRepository;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private Authentication authenticationToken;

    @BeforeEach
    void setUp() {
        Customer mockCustomer = new Customer();
        mockCustomer.setId(1);
        mockCustomer.setUsername("user");
        mockCustomer.setRole("CUSTOMER");

        CustomUserDetails mockUserDetails = new CustomUserDetails(mockCustomer);

        authenticationToken = new UsernamePasswordAuthenticationToken(mockUserDetails, null, mockUserDetails.getAuthorities());
    }

    @Test
    void testAddToCart_NewItem_Success() throws Exception {
        MenuItem menuItem = new MenuItem(1, "Nasi Goreng", "Enak", 15000, "Makanan", null);

        when(menuItemRepository.findById(1)).thenReturn(Optional.of(menuItem));
        when(keranjangItemRepository.findByCustomerAndMenuItem(any(Customer.class), any(MenuItem.class))).thenReturn(Optional.empty());

        mockMvc.perform(post("/cart/add")
                        .with(authentication(authenticationToken)) // <-- GUNAKAN INI
                        .param("menuItemId", "1")
                        .param("quantity", "2"))
                .andExpect(status().isOk())
                .andExpect(content().string("Item quantity updated in cart"));
    }

    @Test
    void testViewCart_Success() throws Exception {
        MenuItem menuItem = new MenuItem(1, "Nasi Goreng", "Enak", 15000, "Makanan", "/uploads/nasgor.jpg");
        KeranjangItem cartItem = new KeranjangItem();
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(2);
        
        when(keranjangItemRepository.findByCustomer(any(Customer.class))).thenReturn(List.of(cartItem));

        mockMvc.perform(get("/cart")
                        .with(authentication(authenticationToken))) // <-- GUNAKAN INI
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Nasi Goreng"));
    }
    
    @Test
    void testRemoveItem_Success() throws Exception {
        MenuItem menuItem = new MenuItem(1, "Nasi Goreng", "Enak", 15000, "Makanan", null);
        KeranjangItem cartItem = new KeranjangItem();
        cartItem.setMenuItem(menuItem);
        
        when(menuItemRepository.findById(1)).thenReturn(Optional.of(menuItem));
        when(keranjangItemRepository.findByCustomerAndMenuItem(any(Customer.class), any(MenuItem.class))).thenReturn(Optional.of(cartItem));
        doNothing().when(keranjangItemRepository).delete(any(KeranjangItem.class));

        mockMvc.perform(delete("/cart/remove")
                        .with(authentication(authenticationToken)) // <-- GUNAKAN INI
                        .param("menuItemId", "1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Item removed from cart"));
    }

    @Test
    void testCheckout_Success() throws Exception {
        MenuItem menuItem = new MenuItem(1, "Nasi Goreng", "Enak", 15000, "Makanan", null);
        KeranjangItem cartItem = new KeranjangItem();
        cartItem.setMenuItem(menuItem);
        cartItem.setQuantity(2);

        Order savedOrder = new Order();
        savedOrder.setOrderId(101);
        savedOrder.setTableNumber(5);
        savedOrder.setCustomer(new Customer()); 
        savedOrder.setTotalPrice(30000.0);
        savedOrder.setStatus(Order.STATUS_CONFIRMED);
        savedOrder.setPaymentStatus(Order.DEFAULT_STATUS_PAYMENT);
        savedOrder.setQueueNumber(1);
        savedOrder.setItems(List.of(menuItem, menuItem));

        when(keranjangItemRepository.findByCustomer(any(Customer.class))).thenReturn(List.of(cartItem));
        when(orderRepository.count()).thenReturn(0L);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        doNothing().when(keranjangItemRepository).deleteByCustomer(any(Customer.class));

        mockMvc.perform(post("/cart/checkout")
                        .with(authentication(authenticationToken)) // <-- GUNAKAN INI
                        .param("tableNumber", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(101));
    }

    @Test
    void testCheckout_EmptyCart_BadRequest() throws Exception {
        when(keranjangItemRepository.findByCustomer(any(Customer.class))).thenReturn(Collections.emptyList());

        mockMvc.perform(post("/cart/checkout")
                        .with(authentication(authenticationToken)) // <-- GUNAKAN INI
                        .param("tableNumber", "5"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAccessCart_Unauthenticated_Forbidden() throws Exception {
        mockMvc.perform(get("/cart"))
                .andExpect(status().isForbidden());
    }
}