package com.example.tair.controller

import org.springframework.http.MediaType
import org.springframework.util.unit.DataSize
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.StandardCopyOption
import java.time.Instant

@RestController
@RequestMapping("/ui")
class UploadController {

    // Saves to system temp dir; you can change this to a persistent folder if you like.
    private val baseDir: Path = Path.of(System.getProperty("java.io.tmpdir"), "tair-uploads")
        .apply { if (!Files.exists(this)) Files.createDirectories(this) }

    @PostMapping(
        "/upload",
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun upload(@RequestPart("file") file: MultipartFile): Map<String, Any> {
        require(!file.isEmpty) { "Empty file" }
        require(file.originalFilename?.endsWith(".xlsx", ignoreCase = true) == true) {
            "Only .xlsx files are supported"
        }
        // Optional: limit size (Spring also supports properties below)
        require(file.size <= DataSize.ofMegabytes(20).toBytes()) { "File too large (>20MB)" }

        val safeName = (file.originalFilename ?: "file.xlsx").replace(Regex("[^a-zA-Z0-9._-]"), "_")
        val ts = Instant.now().epochSecond
        val target = baseDir.resolve("${ts}_$safeName")

        file.inputStream.use { input ->
            Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING)
        }

        // Return a path your Excel reader can open
        return mapOf(
            "savedPath" to target.toAbsolutePath().toString(),
            "originalName" to safeName,
            "size" to file.size
        )
    }
}