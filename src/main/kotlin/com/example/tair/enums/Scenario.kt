package com.example.tair.enums

enum class Scenario(
    val colHeader: String,
    val batterySize: String,
    val batteryMaxPower: String
) {
    LIGHT(colHeader = "Light", batterySize = "30", batteryMaxPower = "60"),
    MEDIUM(colHeader = "Medium", batterySize = "90", batteryMaxPower = "180");

    val displayName: String get() = name.lowercase() // "light"/"medium"
}
