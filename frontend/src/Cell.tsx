import { Box } from '@mantine/core';
import * as React from "react";

export type CellState = 'empty' | 'red' | 'yellow';

interface CellProps {
    state: CellState;
    winIndex?: number;
    onClick?: (e: React.MouseEvent) => void;
    highlightColor?: string;
}

const PIECE_COLOR: Record<CellState, string> = {
    empty:  'transparent',
    red:    '#ef4444',
    yellow: '#facc15',
};

export function Cell({ state, winIndex, onClick, highlightColor }: CellProps) {
    return (
        <Box
            onClick={onClick}
            style={{
                width: 62,
                height: 62,
                borderRadius: '50%',
                backgroundColor: '#151c28',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                boxShadow: state === 'empty' ? 'inset 0 4px 6px rgba(0, 0, 0, 0.4)' : 'none',
                animation: winIndex !== undefined ? `win-flash-${winIndex} 1.2s infinite linear` : 'none',
                zIndex: winIndex !== undefined ? 10 : 1,
                cursor: onClick ? 'pointer' : 'inherit',
            }}
        >
            {state !== 'empty' && (
                <Box
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        backgroundColor: PIECE_COLOR[state],
                        border: highlightColor ? `4px solid ${highlightColor}` : '5px solid rgba(0, 0, 0, 0.15)',
                        boxShadow: highlightColor
                            ? `0 0 15px ${highlightColor}, inset 0 5px 8px rgba(0, 0, 0, 0.4), inset 0 -3px 5px rgba(255, 255, 255, 0.25)`
                            : 'inset 0 5px 8px rgba(0, 0, 0, 0.4), inset 0 -3px 5px rgba(255, 255, 255, 0.25), 0 3px 4px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.15s ease',
                    }}
                />
            )}

            <Box
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    boxShadow: 'inset 0 6px 8px rgba(0, 0, 0, 0.5), inset 0 -1px 2px rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                }}
            />
        </Box>
    );
}