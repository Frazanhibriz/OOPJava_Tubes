package com.tubespbo.foodorder.service;

import java.util.List;
import java.util.Optional;

import com.tubespbo.foodorder.model.MenuItem;

public interface MenuService {
    MenuItem addMenuItem(MenuItem item);
    MenuItem updateMenuItem(MenuItem item);
    void deleteMenuItem(int id);
    List<MenuItem> getAllMenuItems();
    List<MenuItem> filterMenuByCategory(String category);
    List<MenuItem> searchMenuItemByName(String name);
    Optional<MenuItem> getMenuItemById(int id);
    boolean existsById(int id);
}
