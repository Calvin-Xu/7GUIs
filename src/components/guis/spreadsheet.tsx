import { action, makeAutoObservable } from "mobx"
import { observer } from "mobx-react"
import { useState } from "react"
import { evaluate as evaluateFormula } from "../../parser/parser"

const MAX_ROW = 99
const COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")


class CellStore {

    rawValue = ""
    error = false

    constructor() {
        makeAutoObservable(this, {
            setRawValue: action,
            setError: action
        })
    }

    setRawValue(rawValue: string) {
        this.rawValue = rawValue
    }

    setError(error: boolean) {
        this.error = error
    }

    get evaluatedValue() {
        try {
            const result = evaluateFormula(this.rawValue, spreadsheet)
            this.setError(false)
            return result
        } catch (e: any) {
            this.setError(true)
            return e.message
        }
    }
}

const Cell = observer(({ coordinate }: { coordinate: Coordinate }) => {
    const [tempValue, setTempValue] = useState("")
    let cell = spreadsheet.getCellStore(coordinate)

    const handleDoubleClick = action(() => {
        if (!cell) {
            cell = spreadsheet.createCellStore(coordinate)
        }
        setTempValue(cell.rawValue)
        spreadsheet.setEditingCoordinate(coordinate)
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(event.target.value)
    }

    const handleBlur = action(() => {
        if (cell) {
            cell.setRawValue(tempValue)
        }
        spreadsheet.setEditingCoordinate(null)
    })

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (cell) {
                cell.setRawValue(tempValue)
            }
            const coordinateBelow = { row: Math.min(coordinate.row + 1, MAX_ROW), column: coordinate.column }
            spreadsheet.setEditingCoordinate(coordinateBelow)
        } else if (event.key === 'Escape') {
            setTempValue(cell!.rawValue)
            spreadsheet.setEditingCoordinate(null)
        }
    }

    return (
        <div
            onDoubleClick={handleDoubleClick}
            style={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cell?.error ? '#f1a54f' : 'white',
            }}
        >
            {JSON.stringify(spreadsheet.editingCoordinate) == JSON.stringify(coordinate) && cell ? (
                <input
                    type="text"
                    value={tempValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{ width: '100%', height: '100%', textAlign: 'center', margin: 0, padding: 0, fontSize: '1em' }}
                />
            ) : (
                <div>{cell ? cell.evaluatedValue : ""}</div>
            )}
        </div>
    )
})

// type Column = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
// | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z'

type Coordinate = {
    row: number
    column: number
}

class SpreadSheetStore {
    cells: Map<string, CellStore>
    editingCoordinate: Coordinate | null = null

    constructor() {
        this.cells = new Map()
        makeAutoObservable(this)
    }

    private coordinateToKey({ row, column }: Coordinate): string {
        return `${column}${row}`
    }

    getCellStore(coordinate: Coordinate): CellStore | undefined {
        const key = this.coordinateToKey(coordinate)
        return this.cells.get(key)
    }

    createCellStore(coordinate: Coordinate): CellStore {
        const key = this.coordinateToKey(coordinate)
        const newCellStore = new CellStore()
        this.cells.set(key, newCellStore)
        return newCellStore
    }

    setEditingCoordinate(coordinate: Coordinate | null) {
        this.editingCoordinate = coordinate
        if (coordinate && !this.getCellStore(coordinate)) {
            this.createCellStore(coordinate)
        }
    }

    getRange(start: Coordinate, end: Coordinate): { coordinate: Coordinate, value: string }[] {
        const result: { coordinate: Coordinate, value: string }[] = []
        for (let row = start.row; row <= end.row; row++) {
            for (let column = start.column; column <= end.column; column++) {
                const coordinate = { row, column }
                const key = this.coordinateToKey(coordinate)
                const cell = this.cells.get(key)
                if (cell) {
                    result.push({ coordinate, value: cell.evaluatedValue })
                }
            }
        }
        return result
    }
}

const spreadsheet = new SpreadSheetStore()

const Spreadsheet = observer(() => {
    return (
        <div style={{ overflow: "scroll", maxHeight: "300px", maxWidth: "480px" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr>
                        <th style={{ minWidth: 30, border: "1px solid #ccc" }}></th>
                        {COLUMNS.map(column => (
                            <th key={column} style={{ minWidth: 70, textAlign: "center", background: "#f0f0f0", border: "1px solid #ccc" }}>
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 100 }).map((_, rowIndex) => (
                        <tr key={rowIndex}>
                            <td style={{ textAlign: "center", background: "#f0f0f0", border: "1px solid #ccc" }}>{rowIndex}</td>
                            {COLUMNS.map(column => (
                                < td key={column} style={{ border: "1px solid #ccc", height: "1.5em" }}>
                                    <Cell coordinate={{ row: rowIndex, column: COLUMNS.indexOf(column) }} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    )
})

export { SpreadSheetStore, COLUMNS }
export type { Coordinate }

export default Spreadsheet