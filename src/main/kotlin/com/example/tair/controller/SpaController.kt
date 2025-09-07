// src/main/kotlin/com/example/tair/SpaController.kt
package com.example.tair.controller

import jakarta.servlet.http.HttpServletRequest
import org.springframework.core.Ordered
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.servlet.HandlerMapping
import org.springframework.web.server.ResponseStatusException

@Controller
class SpaController {

    // Root → index.html
    @GetMapping("/")
    fun root(): String = "redirect:/index.html"

}