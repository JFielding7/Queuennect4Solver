import { Group, Box, Stack, Text } from '@mantine/core';
import { BoardColumn } from './BoardColumn';
import { type CellState } from './Cell';

interface BoardProps {
    grid: CellState[][];
    disabled?: boolean;
    onColumnClick: (col: number) => void;
    winningCells?: { col: number; row: number }[] | null;
}

export function Board({ grid, disabled = false, onColumnClick, winningCells }: BoardProps) {
    const getWinningRowsForCol = (colIndex: number) => {
        if (!winningCells) return [];
        return winningCells
            .map((cell, index) => cell.col === colIndex ? { row: cell.row, winIndex: index } : null)
            .filter((val): val is { row: number, winIndex: number } => val !== null);
    };

    return (
        <Stack gap={8} align="center">
            <style>{`
        @keyframes win-flash-0 {
          0%, 100% { filter: brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
          16.6%, 83.3% { filter: none; }
        }
        @keyframes win-flash-1 {
          0%, 33.3%, 66.6%, 100% { filter: none; }
          16.6%, 83.3% { filter: brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
        }
        @keyframes win-flash-2 {
          0%, 16.6%, 50%, 83.3%, 100% { filter: none; }
          33.3%, 66.6% { filter: brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
        }
        @keyframes win-flash-3 {
          0%, 33.3%, 66.6%, 100% { filter: none; }
          50% { filter: brightness(2) drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
        }
      `}</style>

            <Box
                style={{
                    backgroundColor: '#1d4ed8',
                    borderRadius: 16,
                    padding: 14,
                }}
            >
                <Group gap={8} align="flex-start" wrap="nowrap">
                    {grid.map((colCells, colIndex) => (
                        <BoardColumn
                            key={colIndex}
                            cells={colCells}
                            colIndex={colIndex}
                            disabled={disabled}
                            onClick={onColumnClick}
                            winningRows={getWinningRowsForCol(colIndex)}
                        />
                    ))}
                </Group>
            </Box>

            <Group gap={8} wrap="nowrap">
                {grid.map((_, colIndex) => (
                    <Text
                        key={`label-${colIndex}`}
                        size="sm"
                        fw={600}
                        c="#6b7a99"
                        style={{
                            width: 62,
                            textAlign: 'center',
                        }}
                    >
                        {String.fromCharCode(65 + colIndex)}
                    </Text>
                ))}
            </Group>
        </Stack>
    );
}