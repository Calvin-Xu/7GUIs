import React, { CSSProperties, PropsWithChildren } from 'react';

type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

interface FlexBoxProps extends PropsWithChildren {
    flexDirection?: FlexDirection;
    gap?: number;
}

const FlexBox: React.FC<FlexBoxProps> = (props) => {
    const style: CSSProperties = {
        ...props,
        display: 'flex',
    };
    return <div style={style}>{props.children}</div>
};

export default FlexBox