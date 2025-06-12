package com.tubespbo.foodorder.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
import com.tubespbo.foodorder.repository.MenuItemRepository;
import com.tubespbo.foodorder.service.MenuService;

@RestController
@RequestMapping("/menu")
public class MenuController {

    private static final Logger logger = LoggerFactory.getLogger(MenuController.class);

    @Autowired
    private MenuService menuService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Value("${app.upload.base-path:${user.dir}}")
    private String appUploadBasePath;

    private final String UPLOADS_DIR_NAME = "uploads";
    private final String MENU_IMAGE_SUBDIR = "menu";

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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem item) {
        MenuItem newItem = menuService.addMenuItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(newItem);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable int id, @RequestBody MenuItem updatedItemDetails) {
        return menuService.getMenuItemById(id).map(existingItem -> {
            existingItem.setName(updatedItemDetails.getName());
            existingItem.setDescription(updatedItemDetails.getDescription());
            existingItem.setPrice(updatedItemDetails.getPrice());
            existingItem.setCategory(updatedItemDetails.getCategory());
            if (updatedItemDetails.getImageUrl() != null || "null".equalsIgnoreCase(String.valueOf(updatedItemDetails.getImageUrl()))) {
                existingItem.setImageUrl(updatedItemDetails.getImageUrl());
            }
            MenuItem savedItem = menuService.updateMenuItem(existingItem);
            return ResponseEntity.ok(savedItem);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMenuItem(@PathVariable int id) {
        if (menuService.existsById(id)) {
            menuService.deleteMenuItem(id);
            return ResponseEntity.ok(Map.of("message", "Menu item with ID " + id + " deleted successfully."));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/upload-image/{menuId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> uploadImage(@PathVariable int menuId, @RequestParam("image") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File gambar tidak boleh kosong"));
        }
        try {
            MenuItem item = menuService.getMenuItemById(menuId)
                    .orElseThrow(() -> new RuntimeException("Menu item not found with id: " + menuId));

            Path uploadPath = Paths.get(appUploadBasePath, UPLOADS_DIR_NAME, MENU_IMAGE_SUBDIR);
            
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                logger.info("Direktori upload dibuat: {}", uploadPath.toAbsolutePath());
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            Path destinationFile = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), destinationFile);

            String relativeImageUrl = "/" + UPLOADS_DIR_NAME + "/" + MENU_IMAGE_SUBDIR + "/" + filename;
            item.setImageUrl(relativeImageUrl);
            menuService.updateMenuItem(item);

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", relativeImageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            logger.error("Gagal mengupload gambar untuk menuId {}: {}", menuId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Gagal mengupload gambar: " + e.getMessage()));
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getMenuCount() {
        return ResponseEntity.ok(Map.of("count", menuItemRepository.count()));
    }
}