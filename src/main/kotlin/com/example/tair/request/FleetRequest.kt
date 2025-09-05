package com.example.tair.request

data class FleetRequest(
    val name: String,
    val ev_type: String = "bev",
    val vehicle_make: String = "b",
    val vehicle_class: String = "a",
    val model: String = "c",
    val no_of_vehicles: String,
    val battery_size: String, // if light 30 if medium 90
    val battery_max_power: String,//if light 60 if medium 180
    val power_type: String = "DC",
    val energy_consumption: String = "1",
    val urban_rural_ratio: String = "",
    val avg_daily_route_distance: String,
    val window_from: String,
    val window_to: String,
    val charging_model_id: String = "afdf4bab-b654-4dc0-8900-e795878a98d9",
    val fleet: String,
)