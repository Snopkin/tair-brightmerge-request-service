// src/main/kotlin/com/example/tair/ui/UiController.kt
package com.example.tair.controller

import com.example.tair.component.ExcelProps
import com.example.tair.component.UserDefaults
import com.example.tair.configuration.*
import com.example.tair.request.FleetRequest
import com.example.tair.service.RequestService
import com.example.tair.service.FleetRequestSender
import com.example.tair.service.TokenService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/ui")
class UiController(
    private val excelService: RequestService,   // your existing service that builds requests
    private val sender: FleetRequestSender,
    private val excelProps: ExcelProps,
    private val userDefaults: UserDefaults,
    private val apiProps: BrightmergeApiProps,
    private val tokenService: TokenService
) {
    @PostMapping("/preview")
    fun preview(@RequestBody cfg: UiConfig): PreviewResponse {
        applyConfig(cfg)

        val items: List<FleetRequest> = excelService.buildRequests(cfg.fleet)
        val light = items.count { it.name.startsWith("light ") }
        val medium = items.count { it.name.startsWith("medium ") }

        return PreviewResponse(
            items = items,
            summary = Summary(total = items.size, light = light, medium = medium)
        )
    }

    @PostMapping("/send")
    fun send(@RequestBody cfg: UiConfig): SendResponse {
        applyConfig(cfg)

        val items: List<FleetRequest> = excelService.buildRequests(cfg.fleet)
        val results = mutableListOf<ResultRow>()
        var sent = 0
        var failed = 0

        items.forEach { req ->
            try {
                val status = sender.send(req)
                if (status.startsWith("HTTP 2")) sent++ else failed++
                results += ResultRow(name = req.name, status = status)
            } catch (ex: Exception) {
                failed++
                results += ResultRow(name = req.name, status = "ERROR ${ex.message}")
            }
        }
        return SendResponse(results = results, summary = SendSummary(sent = sent, failed = failed))
    }

    /** Apply config values to the app's props/services for this run.
     *  Note: This mutates singleton props; fine for single-user/local usage.
     */
    private fun applyConfig(cfg: UiConfig) {
        // Excel settings
        excelProps.path = cfg.path
        excelProps.sheet = cfg.sheet
        excelProps.intervalMinutes = cfg.intervalMinutes
        excelProps.skipZeros = cfg.skipZeros

        // Fleet default
        userDefaults.fleet = cfg.fleet

        // API settings + tokens
        apiProps.url = cfg.url
        apiProps.refreshToken = cfg.refreshToken
        apiProps.accessToken = null // force a refresh on next call
        // Optionally pre-refresh now:
        // tokenService.refreshAccessToken()
    }
}