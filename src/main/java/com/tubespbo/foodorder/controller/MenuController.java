package com.tubespbo.foodorder.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
    public List<MenuItem> getAllMenu() {
        return menuService.getAllMenuItems();
    }

    @GetMapping("/search")
    public List<MenuItem> search(@RequestParam String name) {
        return menuService.searchMenuItemByName(name);
    }

    @GetMapping("/filter")
    public List<MenuItem> filter(@RequestParam String category) {
        return menuService.filterMenuByCategory(category);
    }

    @PostMapping
    public void addMenu(@RequestBody MenuItem item) {
        menuService.addMenuItem(item);
    }

    @PutMapping
    public void updateMenu(@RequestBody MenuItem item) {
        menuService.updateMenuItem(item);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable int id) {
        menuService.deleteMenuItem(id);
    }
}
