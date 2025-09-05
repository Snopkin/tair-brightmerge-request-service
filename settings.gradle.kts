pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
        // mavenLocal()           // optional
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS) // keep strict
    repositories {
        mavenCentral()
        // mavenLocal()           // optional
    }
}

rootProject.name = "tair"