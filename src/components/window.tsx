import React, { PropsWithChildren } from 'react';

interface WindowProps extends PropsWithChildren {
    title?: string,
    resizable?: boolean
}

const Window: React.FC<WindowProps> = (props) => {
    const titleBarHeight = 25;
    const windowStyles = {
        windowContainer: {
            border: '1px solid #acacac',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15), 0 6px 20px 0 rgba(0, 0, 0, 0.14)',
        },
        titleBar: {
            height: titleBarHeight,
            backgroundColor: '#d6e2fb',
            color: 'black',
            fontSize: titleBarHeight * 0.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        contentPane: {
            padding: '10px'
        }
    };

    return (
        <div style={windowStyles.windowContainer}>
            <div style={windowStyles.titleBar}>{props.title}</div>
            <div style={windowStyles.contentPane}>
                {props.children}
            </div>
        </div>
    );
}

export default Window