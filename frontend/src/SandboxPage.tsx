import { useState } from 'react';
import { Stack, Button, Text, Box, Flex, SegmentedControl } from '@mantine/core';
import { Board } from './Board';
import {emptyGrid, dropPiece, gridToFlatString, COLS} from './useGameState';
import type { CellState } from "./Cell";

export function SandboxPage({ onNavigate }: { onNavigate: () => void }) {
    const [grid, setGrid] = useState<CellState[][]>(emptyGrid());
    const [paintMode, setPaintMode] = useState<'red' | 'yellow' | 'alternate'>('alternate');
    const [evals, setEvals] = useState<(number | null)[]>(Array(7).fill(null));
    const [isEvaluating, setIsEvaluating] = useState(false);

    const [currentTurn, setCurrentTurn] = useState<'red' | 'yellow'>('red');

    function handleCellClick(col: number, row: number) {
        if (paintMode === 'alternate') {
            handleColumnClick(col);
            return;
        }

        const next = grid.map(c => [...c]);
        next[col][row] = next[col][row] === paintMode ? 'empty' : paintMode;
        setGrid(next);
        setEvals(Array(COLS).fill(null));
    }

    function handleColumnClick(col: number) {
        const next = dropPiece(grid, col, currentTurn);
        if (next) {
            setGrid(next);
            setEvals(Array(COLS).fill(null));
            setCurrentTurn(prev => prev === 'red' ? 'yellow' : 'red');
        }
    }

    async function handleEvaluate() {
        setIsEvaluating(true);
        try {
            const board = gridToFlatString(grid);
            const res = await fetch('http://localhost:8080/api/evaluate_moves', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ board }),
            });
            if (!res.ok) throw new Error('API Error');
            const data = await res.json();
            setEvals(data);
        } catch (e) {
            console.error('Failed to evaluate position:', e);
            alert('Failed to evaluate. Make sure engine is running and board is valid.');
        } finally {
            setIsEvaluating(false);
        }
    }

    return (
        <Box
            style={{
                minHeight: '100vh',
                backgroundColor: '#151c28',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
            }}
        >
            <Stack align="center" gap="md" w="100%">

                <Stack align="center" gap={4} mb="md">
                    <Text style={{ fontSize: 28, fontWeight: 500, color: '#e8edf5' }}>
                        Engine Sandbox
                    </Text>
                </Stack>

                <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap="xl" w="100%">
                    <Box w={240} display={{ base: 'none', md: 'block' }} />

                    <Box style={{ maxWidth: '100vw', overflowX: 'auto', padding: '10px 0' }}>
                        <Board
                            grid={grid}
                            onColumnClick={handleColumnClick}
                            onCellClick={handleCellClick}
                            evals={evals}
                        />
                    </Box>

                    <Box
                        w={{ base: '100%', md: 240 }}
                        style={{
                            backgroundColor: '#1c2535',
                            border: '0.5px solid #252f42',
                            borderRadius: 16,
                            padding: 20,
                        }}
                    >
                        <Stack gap="lg">
                            <Box>
                                <Text size="xs" fw={600} c="#6b7a99" mb={8} style={{ textTransform: 'uppercase' }}>
                                    Interaction Mode
                                </Text>
                                <SegmentedControl
                                    fullWidth
                                    orientation="vertical"
                                    value={paintMode}
                                    onChange={(v) => setPaintMode(v as 'red' | 'yellow' | 'alternate')}
                                    data={[
                                        { label: '🎮 Play (Alternate)', value: 'alternate' },
                                        { label: '🔴 Paint Red', value: 'red' },
                                        { label: '🟡 Paint Yellow', value: 'yellow' },
                                    ]}
                                    styles={{
                                        root: { backgroundColor: '#151c28' },
                                        indicator: { backgroundColor: '#e8edf5' },
                                        label: { color: '#6b7a99' },
                                        control: {
                                            '&[data-active] label': {
                                                color: '#000000 !important',
                                                fontWeight: '700 !important'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Box>
                                <Text size="xs" fw={600} c="#6b7a99" mb={8} style={{ textTransform: 'uppercase' }}>
                                    Next Move
                                </Text>
                                <SegmentedControl
                                    fullWidth
                                    value={currentTurn}
                                    onChange={(v) => setCurrentTurn(v as 'red' | 'yellow')}
                                    data={[
                                        { label: '🔴 Red', value: 'red' },
                                        { label: '🟡 Yellow', value: 'yellow' },
                                    ]}
                                    styles={{
                                        root: { backgroundColor: '#151c28' },
                                        indicator: { backgroundColor: '#e8edf5' },
                                        label: { color: '#6b7a99' },
                                        control: {
                                            '&[data-active] label': {
                                                color: '#000000 !important',
                                                fontWeight: '700 !important'
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                fullWidth
                                color="indigo"
                                onClick={handleEvaluate}
                                loading={isEvaluating}
                            >
                                Get Evaluations
                            </Button>

                            <Button
                                fullWidth
                                variant="outline"
                                color="gray"
                                onClick={() => {
                                    setGrid(emptyGrid());
                                    setEvals(Array(COLS).fill(null));
                                    setCurrentTurn('red');
                                }}
                            >
                                Clear Board
                            </Button>
                        </Stack>
                    </Box>
                </Flex>

                <Button
                    variant="outline"
                    color="gray"
                    size="md"
                    onClick={onNavigate}
                    styles={{
                        root: {
                            borderColor: '#4a5568',
                            color: '#e8edf5',
                            '&:hover': { backgroundColor: '#1c2535' }
                        }
                    }}
                >
                    Back
                </Button>
            </Stack>
        </Box>
    );
}