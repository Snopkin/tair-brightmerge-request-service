package com.example.tair.component

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "excel")
data class ExcelProps(
    var path: String = "",
    var sheet: String? = null,
    var timeHeader: String = "Time",
    var skipZeros: Boolean = false,
    var intervalMinutes: Long = 60,
    var energyLightHeader: String = "Energy per Light EV",
    var energyMediumHeader: String = "Energy per Medium EV"
)

@Component
@ConfigurationProperties(prefix = "user")
data class UserDefaults(
    var fleet: String = "826a894f-6675-4cb0-8320-ac6c5a0236c4" // user supplies e.g. "826a..." (can also be method arg)
)