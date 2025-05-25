package com.tubespbo.foodorder.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration; // Pastikan ini diimpor
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // Import jika Anda ingin konfigurasi CORS di sini juga
import org.springframework.web.cors.CorsConfiguration; // Import
import org.springframework.web.cors.CorsConfigurationSource; // Import
import org.springframework.web.cors.UrlBasedCorsConfigurationSource; // Import

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // ✅ AKTIFKAN CORS DI SPRING SECURITY
                .csrf(csrf -> csrf.disable()) // Tetap disable CSRF untuk API stateless
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // ✅ IZINKAN SEMUA PREFLIGHT REQUESTS (OPTIONS)
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/menu", "/menu/", "/menu/search", "/menu/filter").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/menu/**").hasRole("ADMIN")
                        .requestMatchers("/order/**").hasAnyRole("CUSTOMER", "ADMIN")
                        .requestMatchers("/cart/**").hasRole("CUSTOMER") // Endpoint /cart/** perlu otentikasi, jadi preflight harus diizinkan
                        .anyRequest().authenticated()
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // ✅ Bean untuk Konfigurasi CORS yang akan digunakan oleh Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000")); // Sesuaikan dengan origin frontend Anda
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Cache-Control", "Content-Type")); // Header yang diizinkan
        configuration.setAllowCredentials(true); // Jika Anda menggunakan credentials

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Terapkan konfigurasi ini ke semua path
        return source;
    }


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}