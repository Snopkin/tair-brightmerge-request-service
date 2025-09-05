// src/main/kotlin/com/example/tair/ui/UiDtos.kt
package com.example.tair.configuration

import com.example.tair.request.FleetRequest

data class UiConfig(
    val url: String,
    val refreshToken: String,
    val fleet: String,
    val intervalMinutes: Long,
    val skipZeros: Boolean,
    val sheet: String,
    val path: String
)

data class PreviewResponse(
    val items: List<FleetRequest>,
    val summary: Summary
)

data class SendResponse(
    val results: List<ResultRow>,
    val summary: SendSummary
)

data class ResultRow(val name: String, val status: String)
data class Summary(val total: Int, val light: Int, val medium: Int)
data class SendSummary(val sent: Int, val failed: Int)