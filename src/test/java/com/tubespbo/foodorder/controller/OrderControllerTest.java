package com.tubespbo.foodorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tubespbo.foodorder.dto.OrderRequest;
import com.tubespbo.foodorder.model.Admin;
import com.tubespbo.foodorder.model.Customer;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.model.Order;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.repository.OrderRepository;
import com.tubespbo.foodorder.security.CustomUserDetails;
import com.tubespbo.foodorder.security.CustomUserDetailsService;
import com.tubespbo.foodorder.security.JwtUtil;
import com.tubespbo.foodorder.security.SecurityConfig;
import com.tubespbo.foodorder.service.OrderService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.hasSize;

@WebMvcTest(OrderController.class)
@Import(SecurityConfig.class)
public class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OrderService orderService;

    @MockBean
    private MenuItemRepository menuItemRepository;

    @MockBean
    private OrderRepository orderRepository;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private Authentication customerAuthToken;
    private Authentication adminAuthToken;
    private Customer mockCustomer;
    
    @BeforeEach
    void setUp() {
        mockCustomer = new Customer();
        mockCustomer.setId(1);
        mockCustomer.setUsername("customer");
        mockCustomer.setRole("CUSTOMER");
        CustomUserDetails customerDetails = new CustomUserDetails(mockCustomer);
        customerAuthToken = new UsernamePasswordAuthenticationToken(customerDetails, null, customerDetails.getAuthorities());

        Admin mockAdmin = new Admin();
        mockAdmin.setId(2);
        mockAdmin.setUsername("admin");
        mockAdmin.setRole("ADMIN");
        CustomUserDetails adminDetails = new CustomUserDetails(mockAdmin);
        adminAuthToken = new UsernamePasswordAuthenticationToken(adminDetails, null, adminDetails.getAuthorities());
    }

    @Test
    void testCreateOrder_AsCustomer_Success() throws Exception {
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setItems(List.of(1));
        orderRequest.setTableNumber(10);

        MenuItem menuItem = new MenuItem(1, "Nasi Goreng", "Enak", 15000, "Makanan", null);
        Order createdOrder = new Order();
        createdOrder.setOrderId(1);
        createdOrder.setCustomer(mockCustomer);
        createdOrder.setItems(List.of(menuItem));

        when(menuItemRepository.findAllById(any())).thenReturn(List.of(menuItem));
        when(orderService.createOrder(any(Customer.class), any(), any(Integer.class))).thenReturn(createdOrder);

        mockMvc.perform(post("/order")
                        .with(authentication(customerAuthToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(1));
    }

    @Test
    void testGetAllOrders_AsAdmin_Success() throws Exception {
        when(orderService.getAllOrders()).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/order")
                        .with(authentication(adminAuthToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testGetAllOrders_AsCustomer_Forbidden() throws Exception {
        mockMvc.perform(get("/order")
                        .with(authentication(customerAuthToken)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testUpdateOrderStatus_AsAdmin_Success() throws Exception {
        Order order = new Order();
        when(orderService.getOrderById(1)).thenReturn(order);

        mockMvc.perform(put("/order/1/status")
                        .with(authentication(adminAuthToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"DELIVERED\""))
                .andExpect(status().isOk());
    }

    @Test
    void testGetMyOrders_AsCustomer_Success() throws Exception {
        Order order = new Order();
        order.setOrderId(1);
        order.setCustomer(mockCustomer);
        
        when(orderService.getOrdersByCustomer(mockCustomer)).thenReturn(List.of(order));
        
        // ✅ PERBAIKAN: Path URL diperbaiki dari "/my" menjadi "/order/my"
        mockMvc.perform(get("/order/my")
                        .with(authentication(customerAuthToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].orderId").value(1));
    }

    @Test
    void testGetOrderCount_AsAdmin_Success() throws Exception {
        when(orderRepository.count()).thenReturn(25L);

        mockMvc.perform(get("/order/count")
                        .with(authentication(adminAuthToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(25));
    }
}