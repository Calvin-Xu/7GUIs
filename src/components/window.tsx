import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react'
import { makeAutoObservable } from 'mobx'

interface WindowProps extends PropsWithChildren {
    title?: string,
    onClose: () => void
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

    const titleBarHeight = 25
    const windowStyles = {
        windowContainer: {
            position: 'relative' as const,
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
        </div >
    )
})

export default Window