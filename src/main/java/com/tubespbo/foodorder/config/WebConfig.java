package com.tubespbo.foodorder.config;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.base-path:${user.dir}}")
    private String appUploadBasePath;

    private final String UPLOADS_DIR_NAME = "uploads";

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(appUploadBasePath, UPLOADS_DIR_NAME).toAbsolutePath();
        String resourceLocation = "file:" + uploadPath.toString();
        if (!resourceLocation.endsWith(File.separator)) {
            resourceLocation += File.separator;
        }

        System.out.println("WebConfig - Menyajikan /uploads/** dari lokasi: " + resourceLocation);

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);
    }
}