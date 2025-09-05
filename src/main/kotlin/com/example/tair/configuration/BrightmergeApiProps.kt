package com.example.tair.configuration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "brightmerge.api")
data class BrightmergeApiProps(
    var url: String = "",
    var refreshToken: String = "",
    var accessToken: String? = null,
)