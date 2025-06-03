package com.tubespbo.foodorder.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths; // Untuk path yang lebih robust
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger; // Logging
import org.slf4j.LoggerFactory; // Logging
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value; // Untuk path upload dari properties
import org.springframework.core.io.Resource; // Untuk melayani file (jika diperlukan nanti)
import org.springframework.core.io.UrlResource; // Untuk melayani file
import org.springframework.http.HttpHeaders; // Untuk melayani file
import org.springframework.http.HttpStatus; // Untuk status code yang lebih eksplisit
import org.springframework.http.MediaType; // Untuk tipe media
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

    // Anda bisa mendefinisikan path ini di application.properties
    // contoh: app.upload.dir=${user.home}/foodorder_uploads
    @Value("${app.upload.dir:${user.dir}/uploads}") // Default ke user.dir/uploads jika tidak ada di properties
    private String baseUploadPath;

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
        Optional<MenuItem> optionalItem = menuService.getMenuItemById(id);
        if (optionalItem.isPresent()) {
            MenuItem existingItem = optionalItem.get();
            existingItem.setName(updatedItemDetails.getName());
            existingItem.setDescription(updatedItemDetails.getDescription());
            existingItem.setPrice(updatedItemDetails.getPrice());
            existingItem.setCategory(updatedItemDetails.getCategory());
            // imageUrl biasanya diupdate melalui endpoint upload-image terpisah
            // Namun, jika frontend mengirimkannya, kita bisa update juga.
            if (updatedItemDetails.getImageUrl() != null) {
                 existingItem.setImageUrl(updatedItemDetails.getImageUrl());
            }
            // Anda mungkin ingin menambahkan validasi untuk status di sini jika masih relevan
            // existingItem.setStatus(updatedItemDetails.getStatus()); 
            MenuItem savedItem = menuService.updateMenuItem(existingItem);
            return ResponseEntity.ok(savedItem);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMenuItem(@PathVariable int id) {
        if (menuService.existsById(id)) {
            menuService.deleteMenuItem(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Menu item deleted successfully");
            return ResponseEntity.ok(response);
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
            Optional<MenuItem> optionalItem = menuService.getMenuItemById(menuId);
            if (optionalItem.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            MenuItem item = optionalItem.get();

            File uploadDirFile = new File(baseUploadPath, MENU_IMAGE_SUBDIR);
            if (!uploadDirFile.exists()) {
                if (!uploadDirFile.mkdirs()) {
                    logger.error("Gagal membuat direktori upload: " + uploadDirFile.getAbsolutePath());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Gagal membuat direktori upload."));
                }
            }

            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            File destinationFile = new File(uploadDirFile.getAbsolutePath(), filename);
            file.transferTo(destinationFile);

            String relativeImageUrl = "/" + "uploads" + "/" + MENU_IMAGE_SUBDIR + "/" + filename;
            item.setImageUrl(relativeImageUrl);
            menuService.updateMenuItem(item);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
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
        long count = menuItemRepository.count();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
}