package com.tubespbo.foodorder.controller;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.service.MenuService;

@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

// Public - Semua pengguna bisa akses
    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuService.getAllMenuItems();
    }

    @GetMapping("/search")
    public List<MenuItem> searchMenu(@RequestParam String name) {
        return menuService.searchMenuItemByName(name);
    }

    @GetMapping("/filter")
    public List<MenuItem> filterByCategory(@RequestParam String category) {
        return menuService.filterMenuByCategory(category);
    }

// ADMIN only
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> addMenuItem(@RequestBody MenuItem item) {
        menuService.addMenuItem(item);
        return ResponseEntity.ok("Menu item added successfully");
    }

// ADMIN only
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMenuItem(@PathVariable int id, @RequestBody MenuItem updatedItem) {
        Optional<MenuItem> optionalItem = menuService.getMenuItemById(id);
        if (optionalItem.isPresent()) {
            MenuItem existingItem = optionalItem.get();
            existingItem.setName(updatedItem.getName());
            existingItem.setDescription(updatedItem.getDescription());
            existingItem.setPrice(updatedItem.getPrice());
            existingItem.setCategory(updatedItem.getCategory());
            existingItem.setImageUrl(updatedItem.getImageUrl());
            menuService.updateMenuItem(existingItem);
            return ResponseEntity.ok("Menu item updated successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

// ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteMenuItem(@PathVariable int id) {
        if (menuService.existsById(id)) {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok("Menu item deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

// ADMIN only - Upload gambar
    @PostMapping("/upload-image/{menuId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadImage(@PathVariable int menuId, @RequestParam("image") MultipartFile file) {
        try {
            Optional<MenuItem> optional = menuService.getMenuItemById(menuId);
            if (optional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            MenuItem item = optional.get();

// Path absolut: simpan di direktori uploads/menu di dalam project
            String uploadDir = System.getProperty("user.dir") + "/uploads/menu/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs(); // Buat folder jika belum ada
            }

            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File dest = new File(directory, filename);
            file.transferTo(dest);

            item.setImageUrl("/uploads/menu/" + filename);
            menuService.updateMenuItem(item);

            return ResponseEntity.ok("Image uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Failed to upload image: " + e.getMessage());
        }
    }
}
