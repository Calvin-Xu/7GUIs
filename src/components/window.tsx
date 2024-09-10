import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { makeAutoObservable } from 'mobx'

class WindowStore {
    width?: number
    height?: number
    startX = 0
    startY = 0
    isResizing = false
    resizeCorner: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left' | null = null
    min_width?: number
    min_height?: number

    constructor() {
        makeAutoObservable(this)
    }

    setSize(width: number, height: number) {
        if (!this.width || !this.height) {
            this.min_width = width
            this.min_height = height
        }
        this.width = width
        this.height = height
    }

    startResizing(x: number, y: number, corner: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left') {
        this.startX = x
        this.startY = y
        this.isResizing = true
        this.resizeCorner = corner
    }

    resize(mouseX: number, mouseY: number) {
        if (!this.width || !this.height) {
            return
        }
        if (this.isResizing) {
            const deltaX = mouseX - this.startX
            const deltaY = mouseY - this.startY

            switch (this.resizeCorner) {
                case 'bottom-right':
                    this.width += deltaX * 4
                    this.height += deltaY
                    break
                // case 'top-left':
                //     this.width -= deltaX * 2
                //     this.height -= deltaY * 2
                //     break
                // case 'top-right':
                //     this.width += deltaX * 2
                //     this.height -= deltaY * 2
                //     break
                case 'bottom-left':
                    this.width -= deltaX * 2
                    this.height += deltaY
                    break
            }

            this.width = Math.max(this.width, this.min_width || 0)
            this.height = Math.max(this.height, this.min_height || 0)

            this.startX = mouseX
            this.startY = mouseY
        }
    }

    stopResizing() {
        this.isResizing = false
        this.resizeCorner = null
    }
}

interface WindowProps extends PropsWithChildren {
    title?: string,
    resizable?: boolean
    onClose: () => void
    windowStore: WindowStore
}

interface CloseButtonProps {
    onClick: () => void
    size: number
}

const CloseButton: React.FC<CloseButtonProps> = ({ onClick, size }) => {
    const [hover, setHover] = useState(false)

    const style = {
        width: size,
        height: size,
        backgroundColor: '#ec6a5e',
        borderRadius: '50%',
        border: 'none',
        position: 'absolute' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        left: size,
        boxSizing: 'border-box' as const,
        padding: 0,
        transform: 'scale(1)' // why mobile Safari
    }

    const crossStyle = {
        position: 'absolute' as const,
        height: size / 6,
        width: '100%',
        backgroundColor: '#6b120b',
        transformOrigin: 'center',
    }

    return (
        <button
            style={style}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onClick}
        >
            {hover && (
                <>
                    <div style={{ ...crossStyle, transform: 'rotate(45deg) scale(0.7)' }}></div>
                    <div style={{ ...crossStyle, transform: 'rotate(-45deg) scale(0.7)' }}></div>
                </>
            )}
        </button>
    )
}

const Window: React.FC<WindowProps> = observer((props: WindowProps) => {
    const windowRef = useRef<HTMLDivElement>(null)

    const windowStore = props.windowStore

    useEffect(() => {
        if (windowRef.current && !windowStore.width && !windowStore.height) {
            const { width, height } = windowRef.current.getBoundingClientRect()
            windowStore.setSize(width, height)
        }
    }, [])

    const handleMouseDown = (event: React.MouseEvent, corner: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left') => {
        if (!props.resizable) return
        windowStore.startResizing(event.clientX, event.clientY, corner)
        event.preventDefault()
    }

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (windowStore.isResizing) {
                windowStore.resize(event.clientX, event.clientY)
            }
        }

        const handleMouseUp = () => {
            windowStore.stopResizing()
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [])

    const resizeHandleStyle = (corner: 'bottom-right' | 'top-left' | 'top-right' | 'bottom-left') => {
        const cursorMap: { [key: string]: string } = {
            'bottom-right': 'nwse-resize',
            'bottom-left': 'nesw-resize',
            // 'top-right': 'nesw-resize',
            // 'top-left': 'nwse-resize',
        }

        return {
            position: 'absolute' as const,
            width: '10px',
            height: '10px',
            backgroundColor: 'transparent',
            cursor: cursorMap[corner],
            [corner.includes('bottom') ? 'bottom' : 'top']: '0',
            [corner.includes('right') ? 'right' : 'left']: '0',
        }
    }

    const titleBarHeight = 25
    const windowStyles = {
        windowContainer: {
            position: 'relative' as const,
            width: `${windowStore.width}px`,
            height: `${windowStore.height}px`,
            border: '1px solid #acacac',
            borderRadius: '10px',
            overflow: 'auto',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.14)',
        },
        titleBar: {
            height: titleBarHeight,
            width: '100%',
            backgroundColor: '#d6e2fb',
            color: 'black',
            fontSize: titleBarHeight * 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        contentPane: {
            padding: '10px',
            width: 'calc(100% - 20px)',
            height: `calc(100% - ${titleBarHeight + 20}px)`,
            backgroundColor: "white"
        },
        // closeButton: {
        //     width: titleBarHeight / 2,
        //     height: titleBarHeight / 2,
        //     backgroundColor: '#ec6a5e',
        //     borderRadius: '50%',
        //     border: 'none',
        //     left: titleBarHeight / 2,
        //     position: 'absolute' as const,
        // }
        //  could have not used a component if supported :hover
    }

    return (
        <div ref={windowRef} style={windowStyles.windowContainer} >
            <div style={windowStyles.titleBar}>
                <CloseButton size={titleBarHeight / 2} onClick={props.onClose} />
                <span>{props.title}</span>
            </div>
            <div style={windowStyles.contentPane}>
                {props.children}
            </div>
            {props.resizable && (
                <>
                    <div style={resizeHandleStyle('bottom-right')} onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}></div>
                    <div style={resizeHandleStyle('top-left')} onMouseDown={(e) => handleMouseDown(e, 'top-left')}></div>
                    <div style={resizeHandleStyle('top-right')} onMouseDown={(e) => handleMouseDown(e, 'top-right')}></div>
                    <div style={resizeHandleStyle('bottom-left')} onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}></div>
                </>
            )
            }
        </div >
    )
})

export default Window
export { WindowStore }