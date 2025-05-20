package com.tubespbo.foodorder;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class FoodorderApplicationTests {

    @Test
    void contextLoads() {
        // Ini hanya memastikan konteks Spring Boot bisa load tanpa error
    }
}
