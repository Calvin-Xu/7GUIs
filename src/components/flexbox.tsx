import React, { CSSProperties, PropsWithChildren } from 'react'

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse'

interface FlexBoxProps extends PropsWithChildren {
    flexDirection?: FlexDirection,
    gap?: number
}

const FlexBox: React.FC<FlexBoxProps> = (props: FlexBoxProps) => {
    const style: CSSProperties = {
        ...props,
        display: 'flex',
        justifyContent: 'space-evenly',
        boxSizing: 'border-box',
    }
    return <div style={style}>{props.children}</div>
}

export default FlexBox