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
        alignItems: 'center',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
    }
    return <div style={style}>{props.children}</div>
}

export default FlexBox