import { action, makeAutoObservable } from "mobx"
import { observer } from "mobx-react"
import { useState, useRef, useEffect } from "react"
import { evaluate as evaluateFormula } from "../../parser/parser"
import { generateSpreadsheetExample } from "../../generateSpreadsheetExample"
import FlexBox from "../flexbox"

const MAX_ROW = 99
const COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

const coordinatesEqual = (a: Coordinate | undefined, b: Coordinate | undefined) =>
    a && b && a.row === b.row && a.column === b.column

class CellStore {
    rawValue = ""
    error = false

    constructor() {
        makeAutoObservable(this, {
            setRawValue: action,
            setError: action,
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

type Coordinate = {
    row: number
    column: number
}

class SpreadSheetStore {
    cells: Map<string, CellStore>
    editingCoordinate: Coordinate | undefined
    selectedCoordinate: Coordinate | undefined

    constructor() {
        this.cells = new Map()
        makeAutoObservable(this)
    }

    private coordinateToKey({ row, column }: Coordinate): string {
        return `${COLUMNS[column]}${row}`
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

    deleteCellStore(coordinate: Coordinate) {
        const key = this.coordinateToKey(coordinate)
        this.cells.delete(key)
    }

    setEditingCoordinate(coordinate: Coordinate | undefined) {
        this.editingCoordinate = coordinate
    }

    setSelectedCoordinate(coordinate: Coordinate | undefined) {
        this.selectedCoordinate = coordinate
    }

    moveSelection(deltaRow: number, deltaColumn: number) {
        if (this.selectedCoordinate) {
            const newRow = Math.max(
                0,
                Math.min(MAX_ROW, this.selectedCoordinate.row + deltaRow)
            )
            const newColumn = Math.max(
                0,
                Math.min(COLUMNS.length - 1, this.selectedCoordinate.column + deltaColumn)
            )
            this.setSelectedCoordinate({ row: newRow, column: newColumn })
        }
    }

    getRange(
        start: Coordinate,
        end: Coordinate
    ): { coordinate: Coordinate; value: string }[] {
        const result: { coordinate: Coordinate; value: string }[] = []
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

// const spreadsheetStore = new SpreadSheetStore()
const spreadsheet = generateSpreadsheetExample()

const Cell = observer(({ coordinate }: { coordinate: Coordinate }) => {
    let cell = spreadsheet.getCellStore(coordinate)
    const [tempValue, setTempValue] = useState(cell?.rawValue || "")

    const isSelected = coordinatesEqual(spreadsheet.selectedCoordinate, coordinate)
    const isEditing = coordinatesEqual(spreadsheet.editingCoordinate, coordinate)
    const cellDivRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isSelected && !isEditing) {
            // if the cell is selected but not being edited, focus the cell's div
            cellDivRef.current?.focus()
        }
    }, [isSelected, isEditing])

    const handleClick = action(() => {
        spreadsheet.setSelectedCoordinate(coordinate)
    })

    const handleDoubleClick = action(() => {
        if (cell && cell.rawValue !== "") {
            setTempValue(cell.rawValue)
            spreadsheet.setEditingCoordinate(coordinate)
            spreadsheet.setSelectedCoordinate(coordinate)
        }
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTempValue(event.target.value)
    }

    const handleBlur = action(() => {
        if (tempValue !== "") {
            // only create a cell store if there's content to save
            let cell = spreadsheet.getCellStore(coordinate)
            if (!cell) {
                cell = spreadsheet.createCellStore(coordinate)
            }
            cell.setRawValue(tempValue)
        }
        spreadsheet.setEditingCoordinate(undefined)
    })

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (isEditing) {
            // editing mode
            if (event.key === 'Enter') {
                if (tempValue !== "") {
                    let cell = spreadsheet.getCellStore(coordinate)
                    if (!cell) {
                        cell = spreadsheet.createCellStore(coordinate)
                    }
                    cell.setRawValue(tempValue)
                }
                const coordinateBelow = {
                    row: Math.min(coordinate.row + 1, MAX_ROW),
                    column: coordinate.column,
                }
                spreadsheet.setSelectedCoordinate(coordinateBelow)
                const cellBelow = spreadsheet.getCellStore(coordinateBelow)
                if (cellBelow && cellBelow.rawValue !== "") {
                    spreadsheet.setEditingCoordinate(coordinateBelow)
                }
                event.preventDefault()
            } else if (event.key === 'Escape') {
                setTempValue(cell ? cell.rawValue : "")
                spreadsheet.setEditingCoordinate(undefined)
                spreadsheet.setSelectedCoordinate(coordinate)
                event.preventDefault()
            }
        } else if (isSelected) {
            // select mode
            if (event.key === 'ArrowUp') {
                event.preventDefault()
                spreadsheet.moveSelection(-1, 0)
            } else if (event.key === 'ArrowDown') {
                event.preventDefault()
                spreadsheet.moveSelection(1, 0)
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault()
                spreadsheet.moveSelection(0, -1)
            } else if (event.key === 'ArrowRight') {
                event.preventDefault()
                spreadsheet.moveSelection(0, 1)
            } else if (event.key === 'Enter') {
                event.preventDefault()
                if (cell && cell.rawValue !== "") {
                    setTempValue(cell.rawValue)
                } else {
                    setTempValue("")
                }
                spreadsheet.setEditingCoordinate(coordinate)
            } else if (event.key === 'Escape') {
                event.preventDefault()
                spreadsheet.setSelectedCoordinate(undefined)
            } else if (event.key === 'Backspace') {
                event.preventDefault()
                if (cell) {
                    cell.setRawValue("")
                    if (cell.rawValue === "") {
                        spreadsheet.deleteCellStore(coordinate)
                    }
                }
            } else if (
                // start editing on any printable character
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.metaKey
            ) {
                event.preventDefault()
                setTempValue(event.key)
                spreadsheet.setEditingCoordinate(coordinate)
            }
        }
    }

    return (
        <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            tabIndex={isSelected && !isEditing ? 0 : -1}
            ref={isSelected && !isEditing ? cellDivRef : null}
            style={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cell?.error ? '#f1a54f' : 'white',
                outline: isSelected ? '2px solid #2963d9' : 'none',
            }}
        >
            {isEditing ? (
                <input
                    type="text"
                    value={tempValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        margin: 0,
                        padding: 0,
                        fontSize: '1em',
                        border: 'none',
                        borderColor: 'transparent',
                    }}
                />
            ) : (
                <div>{cell ? cell.evaluatedValue : ""}</div>
            )}
        </div>
    )
})

const Minibuffer = observer(() => {
    const coordinate = spreadsheet.selectedCoordinate
    let cellLabel = "No Selection"
    let cell: CellStore | undefined
    let inputValue = ""

    if (coordinate) {
        cell = spreadsheet.getCellStore(coordinate)
        cellLabel = `Cell ${COLUMNS[coordinate.column]}${coordinate.row}:`
        inputValue = cell ? cell.rawValue : ""
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (coordinate) {
            let cell = spreadsheet.getCellStore(coordinate)
            if (!cell) {
                cell = spreadsheet.createCellStore(coordinate)
            }
            cell.setRawValue(event.target.value)
        }
    }

    return (
        <FlexBox
            style={{
                padding: '5px 0',
                borderTop: '1px solid #ccc',
                backgroundColor: 'rgba(240, 240, 240, 0.75)',
                borderRadius: '0 0 5px 5px',
                alignItems: 'center',
            }}>
            <label style={{ fontWeight: 'bold', margin: '0 10px' }}>
                {cellLabel}
            </label>
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                disabled={!coordinate}
                style={{
                    flex: 1,
                    padding: '5px',
                    marginRight: '10px',
                    fontSize: '1em',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                }}
            />
        </FlexBox>
    )
})

const Spreadsheet = observer(() => {
    return (
        <div>
            <div style={{ overflow: "scroll", maxHeight: "300px", maxWidth: "490px" }}>
                <table style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th style={{ minWidth: 30, border: "1px solid #ccc" }}></th>
                            {COLUMNS.map(column => (
                                <th
                                    key={column}
                                    style={{
                                        minWidth: 70,
                                        textAlign: "center",
                                        background: "#f0f0f0",
                                        border: "1px solid #ccc",
                                    }}
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 100 }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                <td
                                    style={{
                                        textAlign: "center",
                                        background: "#f0f0f0",
                                        border: "1px solid #ccc",
                                    }}
                                >
                                    {rowIndex}
                                </td>
                                {COLUMNS.map(column => (
                                    <td
                                        key={column}
                                        style={{ border: "1px solid #ccc", height: "1.5em" }}
                                    >
                                        <Cell
                                            coordinate={{
                                                row: rowIndex,
                                                column: COLUMNS.indexOf(column),
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Minibuffer />
        </div>
    )
})

export { SpreadSheetStore, CellStore, COLUMNS }
export type { Coordinate }

export default Spreadsheet
