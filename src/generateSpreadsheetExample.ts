import { SpreadSheetStore, Coordinate } from "./components/guis/spreadsheet"
import { parseCoordinate } from "./parser/parser"

export const generateSpreadsheetExample = () => {
    const store = new SpreadSheetStore()

    const setCell = (coordinate: string, rawValue: string) => {
        const cellStore = store.createCellStore(parseCoordinate(coordinate))
        cellStore.setRawValue(rawValue)
    }

    setCell("A0", "# Rainy Days")
    setCell("B0", "SF")
    setCell("C0", "Vancouver")
    setCell("A1", "Jan")
    setCell("A2", "Feb")
    setCell("A3", "Mar")
    setCell("A4", "Apr")
    setCell("A5", "May")
    setCell("A6", "Jun")
    setCell("A7", "Jul")
    setCell("A8", "Aug")
    setCell("A9", "Sep")
    setCell("A10", "Oct")
    setCell("A11", "Nov")
    setCell("A12", "Dec")

    setCell("B1", "8")
    setCell("B2", "8")
    setCell("B3", "8")
    setCell("B4", "4")
    setCell("B5", "2")
    setCell("B6", "0")
    setCell("B7", "0")
    setCell("B8", "0")
    setCell("B9", "0")
    setCell("B10", "2")
    setCell("B11", "6")
    setCell("B12", "8")

    setCell("C1", "15")
    setCell("C2", "13")
    setCell("C3", "14")
    setCell("C4", "12")
    setCell("C5", "9")
    setCell("C6", "7")
    setCell("C7", "4")
    setCell("C8", "4")
    setCell("C9", "6")
    setCell("C10", "12")
    setCell("C11", "16")
    setCell("C12", "15")

    setCell("E0", "SF")
    setCell("F0", "Vancouver")
    setCell("D1", "mean (μ)")
    setCell("E1", "=mean(B1:B12)")
    setCell("F1", "=mean(C1:C12)")
    setCell("D2", "median")
    setCell("E2", "=median(B1:B12)")
    setCell("F2", "=median(C1:C12)")
    setCell("D3", "std (σ)")
    setCell("E3", "=std(B1:B12)")
    setCell("F3", "=std(C1:C12)")

    setCell("E5", "Hello World!")
    setCell("E6", "本日は晴天なり")

    setCell("F5", "I am Error")
    setCell("F6", "=std(A1:A12)")
    store.getCellStore(parseCoordinate("F6"))?.setError(true)
    store.setSelectedCoordinate(parseCoordinate("A0"))

    return store
}