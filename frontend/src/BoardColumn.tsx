import { useState } from 'react';
import { Stack, Box, UnstyledButton } from '@mantine/core';
import { Cell, type CellState } from './Cell';

interface BoardColumnProps {
    cells: CellState[];
    colIndex: number;
    disabled?: boolean;
    onClick: (col: number) => void;
    winningRows?: { row: number, winIndex: number }[];
    onCellClick?: (col: number, row: number) => void;
    highlightRow?: { row: number, color: string };
}

export function BoardColumn({ cells, colIndex, disabled = false, onClick, winningRows, onCellClick, highlightRow }: BoardColumnProps) {    const [hovered, setHovered] = useState(false);

    return (
        <UnstyledButton
            onClick={() => !disabled && onClick(colIndex)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                cursor: disabled ? 'default' : 'pointer',
                position: 'relative',
                backgroundColor: hovered && !disabled ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                borderRadius: 31,
                transition: 'background-color 0.15s ease',
            }}
        >
            <Box
                style={{
                    position: 'absolute',
                    top: -12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: hovered && !disabled ? '#ffffff' : 'transparent',
                    boxShadow: hovered && !disabled ? '0 0 10px rgba(255,255,255,0.8)' : 'none',
                    transition: 'all 0.15s ease',
                    zIndex: 50,
                }}
            />

            <Stack gap={8} align="center">
                {[...cells].reverse().map((state, i) => {
                    const row = 5 - i;
                    const winData = winningRows?.find(wr => wr.row === row);

                    return (
                        <Cell
                            key={i}
                            state={state}
                            winIndex={winData?.winIndex}
                            onClick={onCellClick ? (e) => {
                                e.stopPropagation();
                                onCellClick(colIndex, row);
                            } : undefined}
                            highlightColor={highlightRow?.row === row ? highlightRow.color : undefined}
                        />
                    );
                })}
            </Stack>
        </UnstyledButton>
    );
}
