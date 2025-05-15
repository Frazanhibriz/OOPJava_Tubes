package com.tubespbo.foodorder.service;

import java.util.List;

import com.tubespbo.foodorder.model.MenuItem;

public interface MenuService {
    void addMenuItem(MenuItem item);
    void updateMenuItem(MenuItem item);
    void deleteMenuItem(int id);
    List<MenuItem> getAllMenuItems();
    List<MenuItem> filterMenuByCategory(String category);
    List<MenuItem> searchMenuItemByName(String name);
}
