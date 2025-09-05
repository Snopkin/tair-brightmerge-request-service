// src/main/kotlin/com/example/fleet/ArrivalsController.kt
package com.example.tair.controller

import com.example.tair.service.RequestService
import com.example.tair.request.FleetRequest
import com.example.tair.service.FleetRequestSender
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class ArrivalsController(
    private val svc: RequestService,
    private val sender: FleetRequestSender

) {
    @GetMapping("/requests/preview")
    fun preview(@RequestParam(required = false) fleetId: String?): List<FleetRequest> =
        svc.buildRequests(fleetId)

    @GetMapping("/requests/send")
    fun sendAll(@RequestParam(required = false) fleetId: String?): List<String> {
        val requests = svc.buildRequests(fleetId)

        return requests.map { req ->
            try {
                sender.send(req) // send synchronously
                "✅ Sent ${req.name}"
            } catch (ex: Exception) {
                "❌ Failed ${req.name}: ${ex.message}"
            }
        }
    }
}