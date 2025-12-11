package me.xyzo.blackwatchBE.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RootController {

    @GetMapping("/")
    public String root() {
        return "BlackWatch API is running on localhost:8080";
    }
}
