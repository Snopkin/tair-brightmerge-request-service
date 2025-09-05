package com.example.tair.service

import com.example.tair.component.ExcelProps
import com.example.tair.component.UserDefaults
import com.example.tair.request.FleetRequest
import org.apache.poi.ss.usermodel.Cell
import org.apache.poi.ss.usermodel.CellType
import org.apache.poi.ss.usermodel.DataFormatter
import org.apache.poi.xssf.usermodel.XSSFWorkbook
import org.springframework.stereotype.Service
import java.io.File
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Service
class RequestService(
    private val excel: ExcelProps,
    private val userDefaults: UserDefaults
) {
    private val fmt = DataFormatter()
    private val hhmm = DateTimeFormatter.ofPattern("HH:mm")
    private val parseH = DateTimeFormatter.ofPattern("H:mm")
    private val parseHa = DateTimeFormatter.ofPattern("h:mm a")

    fun buildRequests(fleetId: String? = null): List<FleetRequest> {
        val file = File(excel.path)
        require(file.exists() && file.isFile) { "Excel not found at ${file.absolutePath}. Check excel.path." }

        XSSFWorkbook(file.inputStream()).use { wb ->
            val sheet = excel.sheet?.let { wb.getSheet(it) } ?: wb.getSheetAt(0)
            val header = sheet.getRow(sheet.firstRowNum) ?: error("Missing header row")

            val map = header.mapIndexedNotNull { idx, c -> c?.let { fmt.formatCellValue(it).trim() to idx } }.toMap()

            val timeCol   = map.getValue(excel.timeHeader)
            val lightCol  = map.getValue("Light")
            val mediumCol = map.getValue("Medium")

            // NEW: energy columns (as text; we’ll keep them as strings)
            val energyLightCol  = map[excel.energyLightHeader]
                ?: error("Header '${excel.energyLightHeader}' not found. Headers: ${map.keys}")
            val energyMediumCol = map[excel.energyMediumHeader]
                ?: error("Header '${excel.energyMediumHeader}' not found. Headers: ${map.keys}")

            val fleet = (fleetId ?: userDefaults.fleet).also { require(it.isNotBlank()) { "fleet must be provided" } }

            val out = mutableListOf<FleetRequest>()
            for (r in (sheet.firstRowNum + 1)..sheet.lastRowNum) {
                val row = sheet.getRow(r) ?: continue

                val from = normalizeTime(fmt.formatCellValue(row.getCell(timeCol)).trim()) ?: continue
                val to   = hhmm.format(LocalTime.parse(from, hhmm).plusMinutes(excel.intervalMinutes))

                val lightCount  = readCount(row.getCell(lightCol))
                val mediumCount = readCount(row.getCell(mediumCol))

                // read energy-per-EV strings (preserve user-visible formatting)
                val energyLightStr  = readText(row.getCell(energyLightCol))   // e.g. "12" or "12.5"
                val energyMediumStr = readText(row.getCell(energyMediumCol))

                // skip whole row if both zero
                if (excel.skipZeros && lightCount == 0 && mediumCount == 0) continue

                if (lightCount > 0 || !excel.skipZeros) {
                    out += FleetRequest(
                        name = "light $from",
                        no_of_vehicles = lightCount.toString(),
                        battery_size = "30",
                        battery_max_power = "60",
                        avg_daily_route_distance = energyLightStr,   // <— now filled
                        window_from = from,
                        window_to = to,
                        fleet = fleet
                    )
                }
                if (mediumCount > 0|| !excel.skipZeros) {
                    out += FleetRequest(
                        name = "medium $from",
                        no_of_vehicles = mediumCount.toString(),
                        battery_size = "90",
                        battery_max_power = "180",
                        avg_daily_route_distance = energyMediumStr,  // <— now filled
                        window_from = from,
                        window_to = to,
                        fleet = fleet
                    )
                }
            }
            return out
        }
    }

    private fun readCount(cell: Cell?): Int =
        when (cell?.cellType) {
            CellType.NUMERIC -> cell.numericCellValue.toInt()
            CellType.STRING  -> cell.stringCellValue.trim().toDoubleOrNull()?.toInt() ?: 0
            else             -> 0
        }

    private fun readText(cell: Cell?): String = fmt.formatCellValue(cell).trim()

    private fun normalizeTime(raw: String): String? {
        val t = raw.trim()
        runCatching { return LocalTime.parse(t, parseH).format(hhmm) }
        runCatching { return LocalTime.parse(t.uppercase(), parseHa).format(hhmm) }
        runCatching { return LocalTime.parse(t, hhmm).format(hhmm) }
        return null
    }
}