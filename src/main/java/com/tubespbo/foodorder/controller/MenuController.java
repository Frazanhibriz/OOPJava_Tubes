package com.tubespbo.foodorder.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.service.MenuService;

@RestController
@RequestMapping("/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

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

    @PostMapping
    public ResponseEntity<String> addMenuItem(@RequestBody MenuItem item) {
        menuService.addMenuItem(item);
        return ResponseEntity.ok("Menu item added successfully");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable int id, @RequestBody MenuItem updatedItem) {
        Optional<MenuItem> optionalItem = menuService.getMenuItemById(id);
        if (optionalItem.isPresent()) {
            MenuItem existingItem = optionalItem.get();
            existingItem.setName(updatedItem.getName());
            existingItem.setDescription(updatedItem.getDescription());
            existingItem.setPrice(updatedItem.getPrice());
            existingItem.setCategory(updatedItem.getCategory());
            menuService.updateMenuItem(existingItem);
            return ResponseEntity.ok("Menu item updated successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteMenuItem(@PathVariable int id) {
        if (menuService.existsById(id)) {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok("Menu item deleted successfully");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
