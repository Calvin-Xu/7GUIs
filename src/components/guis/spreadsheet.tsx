import { action, makeAutoObservable, observable } from "mobx"
import { observer } from "mobx-react"
import React, { useState, useRef, useEffect } from "react"
import { evaluate as evaluateFormula } from "../../parser/parser"
import { generateSpreadsheetExample } from "../../generateSpreadsheetExample"
import FlexBox from "../flexbox"

const MAX_ROW = 99
const COLUMNS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

type Coordinate = {
    row: number
    column: number
}

class CellStore {
    rawValue = ""
    error = false
    isSelected = false
    isEditing = false
    coordinate: Coordinate

    constructor(coordinate: Coordinate) {
        this.coordinate = coordinate
        makeAutoObservable(this, {
            setRawValue: action,
            setError: action,
            setSelected: action,
            setEditing: action,
        })
    }

    setRawValue(rawValue: string) {
        this.rawValue = rawValue
    }

    setError(error: boolean) {
        this.error = error
    }

    setSelected(selected: boolean) {
        this.isSelected = selected
    }

    setEditing(editing: boolean) {
        this.isEditing = editing
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

class SelectionManager {
    selectedCell: CellStore | null = null

    constructor() {
        makeAutoObservable(this, {
            selectedCell: observable,
            selectCell: action,
        })
    }

    selectCell(cell: CellStore) {
        if (this.selectedCell && this.selectedCell !== cell) {
            this.selectedCell.setSelected(false)
            this.selectedCell.setEditing(false)
        }
        cell.setSelected(true)
        this.selectedCell = cell
    }

    editCell(cell: CellStore) {
        this.selectCell(cell)
        cell.setEditing(true)
    }

    clearSelection() {
        if (this.selectedCell) {
            this.selectedCell.setSelected(false)
            this.selectedCell.setEditing(false)
            this.selectedCell = null
        }
    }
}

class SpreadSheetStore {
    cells: Map<string, CellStore>
    selectionManager: SelectionManager

    constructor() {
        this.cells = new Map()
        this.selectionManager = new SelectionManager()
        makeAutoObservable(this)
    }

    private coordinateToKey({ row, column }: Coordinate): string {
        return `${COLUMNS[column]}${row}`
    }

    getCellStore(coordinate: Coordinate): CellStore {
        const key = this.coordinateToKey(coordinate)
        let cell = this.cells.get(key)
        if (!cell) {
            cell = new CellStore(coordinate)
            this.cells.set(key, cell)
        }
        return cell
    }

    deleteCellStore(coordinate: Coordinate) {
        const key = this.coordinateToKey(coordinate)
        this.cells.delete(key)
    }

    moveSelection(deltaRow: number, deltaColumn: number) {
        const currentCell = this.selectionManager.selectedCell
        if (currentCell) {
            const newRow = Math.max(
                0,
                Math.min(MAX_ROW, currentCell.coordinate.row + deltaRow)
            )
            const newColumn = Math.max(
                0,
                Math.min(COLUMNS.length - 1, currentCell.coordinate.column + deltaColumn)
            )
            const newCoordinate = { row: newRow, column: newColumn }
            const newCell = this.getCellStore(newCoordinate)
            this.selectionManager.selectCell(newCell)
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
    const cell = spreadsheet.getCellStore(coordinate)
    const [originalValue, setOriginalValue] = useState(cell.rawValue)
    const cellDivRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (cell.isSelected && !cell.isEditing) {
            cellDivRef.current?.focus()
        }
    }, [cell.isSelected, cell.isEditing])

    const handleClick = action(() => {
        spreadsheet.selectionManager.selectCell(cell)
    })

    const handleDoubleClick = action(() => {
        if (cell.rawValue !== "") {
            setOriginalValue(cell.rawValue)
            spreadsheet.selectionManager.editCell(cell)
        }
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        cell.setRawValue(event.target.value)
    }

    const handleBlur = action(() => {
        if (cell.rawValue === "") {
            spreadsheet.deleteCellStore(coordinate)
        }
        cell.setEditing(false)
    })

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (cell.isEditing) {
            // edit mode
            if (event.key === 'Enter') {
                const coordinateBelow = {
                    row: Math.min(coordinate.row + 1, MAX_ROW),
                    column: coordinate.column,
                }
                const cellBelow = spreadsheet.getCellStore(coordinateBelow)
                spreadsheet.selectionManager.editCell(cellBelow)
                event.preventDefault()
            } else if (event.key === 'Escape') {
                cell.setRawValue(originalValue)
                if (cell.rawValue === "") {
                    spreadsheet.deleteCellStore(coordinate)
                }
                cell.setEditing(false)
                event.preventDefault()
            }
        } else if (cell.isSelected) {
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
                if (cell.rawValue !== "") {
                    setOriginalValue(cell.rawValue)
                } else {
                    setOriginalValue("")
                }
                spreadsheet.selectionManager.editCell(cell)
                event.preventDefault()
            } else if (event.key === 'Escape') {
                spreadsheet.selectionManager.clearSelection()
                event.preventDefault()
            } else if (event.key === 'Backspace') {
                event.preventDefault()
                cell.setRawValue("")
                spreadsheet.deleteCellStore(coordinate)
            } else if (
                // start editing on any printable character
                event.key.length === 1 &&
                !event.ctrlKey &&
                !event.metaKey
            ) {
                spreadsheet.selectionManager.editCell(cell)
                cell.setRawValue(event.key)
                setOriginalValue("")
                event.preventDefault()
            }
        }
    }

    return (
        <div
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            tabIndex={cell.isSelected && !cell.isEditing ? 0 : -1}
            ref={cell.isSelected && !cell.isEditing ? cellDivRef : null}
            style={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: cell.error ? '#f1a54f' : 'white',
                outline: cell.isSelected ? '2px solid #2963d9' : 'none',
            }}
        >
            {cell.isEditing ? (
                <input
                    type="text"
                    value={cell.rawValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    style={{
                        width: '100%',
                        height: '100%',
                        textAlign: 'center',
                        fontSize: '1em',
                        border: 'none',
                        outline: 'none',
                    }}
                />
            ) : (
                <div style={{ width: '100%', textAlign: 'center', fontSize: '1em' }}>
                    {cell.evaluatedValue}
                </div>
            )}
        </div>
    )
})

const Minibuffer = observer(() => {
    const selectedCell = spreadsheet.selectionManager.selectedCell
    let cellLabel = "No Selection"
    let inputValue = ""

    if (selectedCell) {
        const coordinate = selectedCell.coordinate
        cellLabel = `Cell ${COLUMNS[coordinate.column]}${coordinate.row}:`
        inputValue = selectedCell.rawValue
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedCell) {
            selectedCell.setRawValue(event.target.value)
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
                disabled={!selectedCell}
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
                                {COLUMNS.map((column, columnIndex) => {
                                    const coordinate = { row: rowIndex, column: columnIndex }
                                    return (
                                        <td
                                            key={column}
                                            style={{ border: "1px solid #ccc", height: "1.5em" }}
                                        >
                                            <Cell
                                                coordinate={coordinate}
                                            />
                                        </td>
                                    )
                                })}
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
