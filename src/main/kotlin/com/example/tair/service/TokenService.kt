// src/main/kotlin/com/example/tair/service/TokenService.kt
package com.example.tair.service

import com.example.tair.configuration.BrightmergeApiProps
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate

@Service
class TokenService(
    private val restTemplate: RestTemplate,
    private val props: BrightmergeApiProps
) {
    @Volatile private var refreshing = false

    fun getAccessToken(): String {
        props.accessToken?.let { return it }
        refreshAccessToken()
        return props.accessToken ?: error("No access token after refresh (check refresh token).")
    }

    @Synchronized
    fun refreshAccessToken() {
        if (refreshing) return
        refreshing = true
        try {
            require(props.refreshToken.isNotBlank()) { "brightmerge.api.refresh-token is blank." }

            val url = "${props.url}/api/v1/auth/token/refresh/"
            val headers = HttpHeaders().apply {
                contentType = MediaType.APPLICATION_JSON
                accept = listOf(MediaType.APPLICATION_JSON)
            }
            val body = mapOf("refresh" to props.refreshToken)

            val resp = restTemplate.postForEntity(url, HttpEntity(body, headers), Map::class.java)
            if (!resp.statusCode.is2xxSuccessful) {
                throw IllegalStateException("Token refresh failed: HTTP ${resp.statusCode.value()} ${resp.body}")
            }

            @Suppress("UNCHECKED_CAST")
            val json = resp.body as Map<String, Any?>
            val access = (json["access"] as? String)?.trim()
            val newRefresh = (json["refresh"] as? String)?.trim()

            require(!access.isNullOrBlank()) { "No 'access' in refresh response." }
            props.accessToken = access
            if (!newRefresh.isNullOrBlank()) props.refreshToken = newRefresh
        } catch (e: HttpClientErrorException) {
            val body = e.responseBodyAsString
            throw IllegalStateException("Token refresh HTTP ${e.statusCode.value()} ${body.ifBlank { "[no body]" }}", e)
        } finally {
            refreshing = false
        }
    }

    fun invalidate() {
        props.accessToken = null
    }
}