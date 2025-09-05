import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
	id("org.springframework.boot") version "3.5.5"
	id("io.spring.dependency-management") version "1.1.6"

	kotlin("jvm") version "1.9.25"
	kotlin("plugin.spring") version "1.9.25"

	// add both of these:
	id("application")                         // <-- gives you application { } block
	id("org.beryx.jlink") version "3.0.1"     // <-- Badass JLink + jpackage
}

group = "com.example"
version = "1.0.0"
java.sourceCompatibility = JavaVersion.VERSION_21


dependencies {
	implementation("org.springframework.boot:spring-boot-starter-web")
	implementation("org.springframework.boot:spring-boot-starter-validation")

	implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
	implementation(kotlin("reflect"))
	implementation(kotlin("stdlib"))

	// Apache POI (Excel)
	implementation("org.apache.poi:poi-ooxml:5.2.5")

	testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<KotlinCompile> {
	kotlinOptions {
		jvmTarget = "21"
		freeCompilerArgs = listOf("-Xjsr305=strict")
	}
}

application {
	// main class of your Spring Boot app
	mainClass.set("com.example.tair.TairApplicationKt")
}

// Make sure BootJar is produced (the default). If you also use 'jar', disable it:
tasks.jar { enabled = false }
tasks.bootJar { enabled = true }

// ---- Badass JLink / JPackage configuration ----

jlink {
	// optional runtime trimming & split-package safety
	options.set(listOf("--strip-debug", "--no-header-files", "--no-man-pages"))
	forceMerge("kotlin", "jackson")

	launcher {
		name = "brightmerge-uploader"  // the generated launcher name
	}

	jpackage {
		// These are plain Strings / Lists in this plugin – use '='
		imageName = "Brightmerge Uploader"
		vendor = "Your Company"
		appVersion = project.version.toString()

		// Pick installer type by OS
		val os = org.gradle.internal.os.OperatingSystem.current()
		installerType = when {
			os.isMacOsX   -> "dmg"   // or "pkg"
			os.isWindows  -> "exe"   // or "msi"
			else          -> "deb"   // or "rpm"
		}

		// Optional extra flags
		installerOptions = listOf(
			"--description", "Upload EV groupings to Brightmerge"
			// If you add an icon: "--icon", file("packaging/icon.icns").absolutePath
		)

		// If you want an app image (without installer), you can also set:
		// imageOptions = listOf("--icon", file("packaging/icon.icns").absolutePath)
	}
}