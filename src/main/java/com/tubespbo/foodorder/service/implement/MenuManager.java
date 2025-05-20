package com.tubespbo.foodorder.service.implement;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tubespbo.foodorder.model.MenuItem;
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.service.MenuService;

@Service
public class MenuManager implements MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Override
    public void addMenuItem(MenuItem item) {
        menuItemRepository.save(item);
    }

    @Override
    public void updateMenuItem(MenuItem item) {
        menuItemRepository.save(item);
    }

    @Override
    public void deleteMenuItem(int id) {
        menuItemRepository.deleteById(id);
    }

    @Override
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    @Override
    public List<MenuItem> filterMenuByCategory(String category) {
        return menuItemRepository.findByCategory(category);
    }

    @Override
    public List<MenuItem> searchMenuItemByName(String name) {
        return menuItemRepository.findByNameContainingIgnoreCase(name);
    }

    @Override
    public Optional<MenuItem> getMenuItemById(int id) {
        return menuItemRepository.findById(id);
    }

    @Override
    public boolean existsById(int id) {
        return menuItemRepository.existsById(id);
    }
}
