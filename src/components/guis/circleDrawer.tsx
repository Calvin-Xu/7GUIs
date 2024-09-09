import { observer } from "mobx-react"
import FlexBox from "../flexbox"
import { action, autorun, makeObservable, observable } from "mobx"
import { useEffect, useRef, useState } from "react"

interface Circle {
    id: number // autoincrement
    x: number
    y: number
    diameter: number
}

const DEFAULT_DIAMETER = 40

const CANVAS_WIDTH = 480
const CANVAS_HEIGHT = 270
const SCALE = 4 // for high DPI

class CircleStore {
    highestId: number = 1

    circles: Circle[] = []

    selected: Circle | undefined
    undoStack: Circle[][] = []
    redoStack: Circle[][] = []

    constructor() {
        makeObservable(this, {
            circles: observable,
            selected: observable,
            undoStack: observable,
            redoStack: observable,
            addCircle: action,
            selectCircleNear: action,
            adjustDiameter: action,
            pushNewState: action,
            undo: action,
            redo: action
        })
    }

    addCircle(x: number, y: number, diameter: number = DEFAULT_DIAMETER) {
        this.pushNewState()
        const circle: Circle = { id: this.highestId++, x, y, diameter }
        this.circles.push(circle)
    }

    selectCircleNear(x: number, y: number) {
        const closest = this.circles.reduce((closest, circle) => {
            const distance = Math.sqrt(Math.pow(circle.x - x, 2) + Math.pow(circle.y - y, 2))
            if (distance < circle.diameter / 2 && (!closest.circle || distance < closest.distance)) {
                return { circle, distance }
            }
            return closest
        }, { circle: undefined as Circle | undefined, distance: Infinity })

        this.selected = closest.circle
    }

    adjustDiameter(newDiameter: number) {
        if (this.selected) {
            this.selected.diameter = newDiameter
        }
    }

    pushNewState() {
        // actually shallow copy
        this.undoStack.push(this.circles.map(circle => ({ ...circle })))
        this.redoStack = []
    }

    undo() {
        if (this.undoStack.length > 0) {
            this.redoStack.push(this.circles.map(circle => ({ ...circle })))
            const state = this.undoStack.pop()
            if (state) {
                this.circles = state
            }
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            this.undoStack.push(this.circles.map(circle => ({ ...circle })))
            const state = this.redoStack.pop()
            if (state) {
                this.circles = state
            }
        }
    }
}

const circleStore = new CircleStore()

const CircleDrawer = observer(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [showPopup, setShowPopup] = useState(false)
    const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) {
            return
        }
        const disposer = autorun(() => drawCircles(ctx))
        return () => disposer()
    }, [])

    const drawCircles = (ctx: CanvasRenderingContext2D) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        ctx.lineWidth = 1.25 * SCALE
        circleStore.circles.forEach(circle => {
            ctx.beginPath()
            ctx.arc(circle.x * SCALE, circle.y * SCALE, circle.diameter / 2 * SCALE, 0, 2 * Math.PI)
            ctx.fillStyle = (circleStore.selected?.id === circle.id) ? '#e9f0fd' : 'rgba(0,0,0,0)'
            ctx.fill()
            ctx.stroke()
        })
    }

    const getCursorPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = Math.floor((e.clientX - rect.left))
        const y = Math.floor((e.clientY - rect.top))
        return { x, y }
    }

    const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCursorPoint(e)
        circleStore.addCircle(x, y)
        if (showPopup) {
            closePopup()
        }
        circleStore.selectCircleNear(x, y)
    }

    const onCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = getCursorPoint(e)
        if (showPopup) {
            // stop selection changes
        } else {
            circleStore.selectCircleNear(x, y)
        }
    }

    const onCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const selectedCircle = circleStore.selected
        if (!selectedCircle) {
            return
        }
        const canvasRect = canvasRef.current?.getBoundingClientRect()
        if (!canvasRect) {
            return
        }
        setPopupPosition({
            x: (canvasRect.left + selectedCircle.x + selectedCircle.diameter / 2 / 1.4),
            y: (canvasRect.top + selectedCircle.y + selectedCircle.diameter / 2 / 1.4)
        })
        circleStore.pushNewState()
        setShowPopup(true)
    }

    const closePopup = () => {
        setShowPopup(false)
    }

    return <FlexBox flexDirection="column" gap={10}>
        <FlexBox flexDirection="row" justifyContent="center" gap={10}>
            <button onClick={() => circleStore.undo()} disabled={circleStore.undoStack.length === 0}>Undo</button>
            <button onClick={() => circleStore.redo()} disabled={circleStore.redoStack.length === 0}>Redo</button>
            {/* ! why arrow function: this binding in javascript */}
        </FlexBox>
        <canvas
            style={{ border: "1px solid #666667", borderRadius: "5px", margin: "0 0 10px 0", width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            ref={canvasRef} width={CANVAS_WIDTH * SCALE} height={CANVAS_HEIGHT * SCALE}
            onClick={onCanvasClick} onMouseMove={onCanvasMouseMove} onContextMenu={onCanvasRightClick}></canvas>
        {(showPopup) && (
            <div style={{
                position: 'fixed',
                left: `${popupPosition.x}px`,
                top: `${popupPosition.y}px`,
                border: '1px solid #ccc',
                borderRadius: '10px',
                padding: '5px',
                backgroundColor: 'white',
                // zIndex: 9999
            }}>
                <FlexBox flexDirection="column" gap={10} alignItems="center">
                    <label>Adjust diameter of circle at ({circleStore.selected?.x}, {circleStore.selected?.y})</label>
                    <FlexBox flexDirection="row" gap={10} justifyContent="center">
                        <label>{circleStore.selected?.diameter}</label>
                        <input
                            type="range" min="10" max="200"
                            value={circleStore.selected?.diameter}
                            onChange={(e) => circleStore.adjustDiameter(parseInt(e.target.value))} />
                        <button onClick={closePopup}>Close</button>
                    </FlexBox>
                </FlexBox>
            </div>
        )}
    </FlexBox>
})

export default CircleDrawer