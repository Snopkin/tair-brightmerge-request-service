package com.example.tair.service


import com.example.tair.configuration.BrightmergeApiProps
import com.example.tair.request.FleetRequest
import com.example.tair.service.TokenService
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException
import org.springframework.web.client.RestTemplate

@Service
class FleetRequestSender(
    private val restTemplate: RestTemplate,
    private val tokenService: TokenService,
    private val props: BrightmergeApiProps
) {
    private fun headers(token: String) = HttpHeaders().apply {
        contentType = MediaType.APPLICATION_JSON
        accept = listOf(MediaType.APPLICATION_JSON)
        add(HttpHeaders.AUTHORIZATION, "Bearer $token")
    }

    fun send(req: FleetRequest): String {
        val url = "${props.url}/api/v1/vehicle-grouping/"

        val entity = HttpEntity(req, headers(tokenService.getAccessToken()))
        val resp = try {
            restTemplate.postForEntity(url, entity, String::class.java)
        } catch (e: HttpClientErrorException.Unauthorized) {
            tokenService.refreshAccessToken()
            restTemplate.postForEntity(url, HttpEntity(req, headers(tokenService.getAccessToken())), String::class.java)
        }

        val code = resp.statusCode.value()
        val reason = org.springframework.http.HttpStatus.resolve(code)?.reasonPhrase ?: ""
        return "HTTP $code $reason ${resp.body ?: ""}".trim()
    }
}