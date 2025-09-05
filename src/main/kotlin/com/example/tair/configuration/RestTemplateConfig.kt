// src/main/kotlin/com/example/fleet/RestTemplateConfig.kt
package com.example.tair.configuration

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.client.RestTemplate

@Configuration
class RestTemplateConfig {
    @Bean
    fun restTemplate() = RestTemplate()
}