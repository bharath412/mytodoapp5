package com.example.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello2") // Changed from "/api/hello" to "/api/hello2"
    public String hello() {
        return "Hello from Spring Boot!";
    }
}
