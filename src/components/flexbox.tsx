import React, { CSSProperties, PropsWithChildren } from 'react'

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'

interface FlexBoxProps extends PropsWithChildren {
    flexDirection?: FlexDirection,
    gap?: number,
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly' | 'start' | 'end' | 'left' | 'right',
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch',
    width?: string
    height?: string
    style?: CSSProperties
}

const FlexBox: React.FC<FlexBoxProps> = ({ flexDirection = 'row', justifyContent = 'flex-start', alignItems = 'center', gap = 0, width = '100%', height = '100%', style, children, ...rest }) => {
    const combinedStyle: CSSProperties = {
        display: 'flex',
        flexDirection,
        justifyContent,
        alignItems,
        gap: `${gap}px`,
        width,
        height,
        ...style,
        ...rest
    }
    return <div style={combinedStyle}>{children}</div>
}

export default FlexBox
