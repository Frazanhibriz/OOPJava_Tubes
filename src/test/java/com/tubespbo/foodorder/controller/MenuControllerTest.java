package com.tubespbo.foodorder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.security.CustomUserDetailsService;
import com.tubespbo.foodorder.security.JwtUtil;
import com.tubespbo.foodorder.security.SecurityConfig;
import com.tubespbo.foodorder.service.MenuService;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// STRATEGI BARU: Impor konfigurasi secara eksplisit
@WebMvcTest(controllers = MenuController.class)
@Import(SecurityConfig.class)
public class MenuControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Kita mock semua dependensi yang dibutuhkan oleh MenuController dan SecurityConfig
    @MockBean
    private MenuService menuService;

    @MockBean
    private MenuItemRepository menuItemRepository;

    @MockBean
    private JwtUtil jwtUtil;

    // Ini adalah MockBean yang paling krusial.
    // Ini akan menggantikan bean UserDetailsService yang asli dari SecurityConfig.
    @MockBean
    private CustomUserDetailsService customUserDetailsService;


    @Test
    void testGetAllMenuItems_Success() throws Exception {
        MenuItem item = new MenuItem(1, "Nasi Goreng", "Nasi digoreng", 15000, "Makanan", null);
        when(menuService.getAllMenuItems()).thenReturn(List.of(item));

        mockMvc.perform(get("/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Nasi Goreng"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void testAddMenuItem_AsCustomer_Forbidden() throws Exception {
        MenuItem newItem = new MenuItem(0, "Menu Baru", "Desc", 10000, "Makanan", null);

        mockMvc.perform(post("/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newItem)))
                .andExpect(status().isForbidden());
    }
    
    @Test
    @WithMockUser(roles = "ADMIN")
    void testAddMenuItem_AsAdmin_Success() throws Exception {
        MenuItem newItem = new MenuItem(0, "Nasi Padang", "Enak", 25000, "Makanan", null);
        MenuItem savedItem = new MenuItem(1, "Nasi Padang", "Enak", 25000, "Makanan", null);

        when(menuService.addMenuItem(any(MenuItem.class))).thenReturn(savedItem);

        mockMvc.perform(post("/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newItem)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.menuId").value(1))
                .andExpect(jsonPath("$.name").value("Nasi Padang"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateMenuItem_AsAdmin_Success() throws Exception {
        MenuItem existingItem = new MenuItem(1, "Nasi Uduk", "Lama", 12000, "Makanan", null);
        MenuItem updatedItem = new MenuItem(1, "Nasi Uduk Spesial", "Baru", 15000, "Makanan", null);

        when(menuService.getMenuItemById(1)).thenReturn(Optional.of(existingItem));
        when(menuService.updateMenuItem(any(MenuItem.class))).thenReturn(updatedItem);

        mockMvc.perform(put("/menu/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedItem)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nasi Uduk Spesial"))
                .andExpect(jsonPath("$.price").value(15000));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeleteMenuItem_AsAdmin_Success() throws Exception {
        when(menuService.existsById(1)).thenReturn(true);
        doNothing().when(menuService).deleteMenuItem(1);

        mockMvc.perform(delete("/menu/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Menu item with ID 1 deleted successfully."));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUploadImage_AsAdmin_Success() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "image",
                "test.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "test image content".getBytes()
        );

        MenuItem item = new MenuItem(1, "Ayam Bakar", "Dibakar", 20000, "Makanan", null);
        
        when(menuService.getMenuItemById(1)).thenReturn(Optional.of(item));

        mockMvc.perform(multipart("/menu/upload-image/1").file(mockFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imageUrl").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetMenuCount_AsAdmin_Success() throws Exception {
        when(menuItemRepository.count()).thenReturn(5L);

        mockMvc.perform(get("/menu/count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }
}