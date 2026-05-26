import { useState, useMemo, useEffect, useRef } from 'react';
import { Stack, Button, Text, Box, Flex, Group, ScrollArea } from '@mantine/core';
import { Board } from './Board';
import { emptyGrid, dropPiece, gridToFlatString } from './useGameState';
import type { MoveRecord } from './useGameState';

type MoveClassification = 'Best' | 'Inaccuracy' | 'Blunder' | 'Pending';

function getClassification(evals: (number | null)[], playedCol: number): { type: MoveClassification, bestCols: number[] } {
    const validEvals = evals.filter((e): e is number => e !== null);
    if (validEvals.length === 0) return { type: 'Pending', bestCols: [] };

    const maxEval = Math.max(...validEvals);
    const playedEval = evals[playedCol];

    const bestCols = evals
        .map((e, idx) => (e !== null && e === maxEval) ? idx : -1)
        .filter(idx => idx !== -1);

    if (playedEval === null) return { type: 'Pending', bestCols: [] };
    if (playedEval === maxEval) return { type: 'Best', bestCols };
    if (maxEval > 0 && playedEval <= 0) return { type: 'Blunder', bestCols };
    if (maxEval === 0 && playedEval < 0) return { type: 'Blunder', bestCols };

    return { type: 'Inaccuracy', bestCols };
}

export function AnalysisPage({ initialHistory, onNavigate }: { initialHistory: MoveRecord[], onNavigate: () => void }) {
    const [activeLine] = useState<MoveRecord[]>(initialHistory);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    const [evalCache, setEvalCache] = useState<Record<number, (number | null)[]>>({});
    const [fetching, setFetching] = useState<Set<number>>(new Set());

    const viewportRef = useRef<HTMLDivElement>(null);
    const moveRefs = useRef<(HTMLDivElement | null)[]>([]);

    const boardStates = useMemo(() => {
        const states = [emptyGrid()];
        for (let i = 0; i < activeLine.length; i++) {
            const next = dropPiece(states[i], activeLine[i].col, activeLine[i].piece);
            states.push(next || states[i]);
        }
        return states;
    }, [activeLine]);

    const currentBoard = boardStates[currentMoveIndex];

    useEffect(() => {
        const fetchPos = async (idx: number) => {
            if (evalCache[idx] || fetching.has(idx)) return;

            setFetching(prev => new Set(prev).add(idx));
            try {
                const boardStr = gridToFlatString(boardStates[idx]);
                const res = await fetch('http://localhost:8080/api/evaluate_moves', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ board: boardStr }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setEvalCache(prev => ({ ...prev, [idx]: data }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setFetching(prev => {
                    const next = new Set(prev);
                    next.delete(idx);
                    return next;
                });
            }
        };

        fetchPos(currentMoveIndex);
        if (currentMoveIndex > 0) fetchPos(currentMoveIndex - 1);

    }, [currentMoveIndex, evalCache, fetching, boardStates]);

    useEffect(() => {
        if (currentMoveIndex === 0) {
            viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const activeIndex = currentMoveIndex - 1;
            moveRefs.current[activeIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentMoveIndex]);

    let classificationStr = '';
    let classificationColor = '#6b7a99';
    let highlightCell: { col: number; row: number; color: string } | undefined = undefined;

    if (currentMoveIndex === 0) {
        classificationStr = 'Starting Position';
        classificationColor = '#6b7a99';
    } else {
        const prevIdx = currentMoveIndex - 1;
        const playedMove = activeLine[prevIdx];
        const previousEvals = evalCache[prevIdx];

        if (previousEvals) {
            const { type: c, bestCols } = getClassification(previousEvals, playedMove.col);
            const colLetter = String.fromCharCode(65 + playedMove.col);

            const bestColLetters = bestCols.map(col => String.fromCharCode(65 + col)).join(', ');
            const isAre = bestCols.length > 1 ? 'are' : 'is';
            const bestText = `${bestColLetters} ${isAre} Best`;

            if (c === 'Best') {
                classificationStr = `★ ${colLetter} is Best`;
                classificationColor = '#10b981';
            } else if (c === 'Inaccuracy') {
                classificationStr = `?! ${colLetter} is an Inaccuracy. ${bestText}.`;
                classificationColor = '#f59e0b';
            } else if (c === 'Blunder') {
                classificationStr = `?? ${colLetter} is a Blunder. ${bestText}.`;
                classificationColor = '#ef4444';
            }

            highlightCell = { col: playedMove.col, row: 0, color: classificationColor };
        } else {
            classificationStr = 'Analyzing...';
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
                <Stack align="center" gap={4} mb="sm">
                    <Text style={{ fontSize: 28, fontWeight: 500, color: '#e8edf5' }}>
                        Game Review
                    </Text>
                </Stack>

                <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap="xl" w="100%">
                    <Box w={240} display={{ base: 'none', md: 'block' }} />

                    <Stack align="center" gap="xs">
                        <Box
                            style={{
                                backgroundColor: '#1c2535',
                                border: `1px solid ${classificationColor}`,
                                borderRadius: 8,
                                padding: '6px 16px',
                                minHeight: 34,
                                transition: 'border-color 0.2s ease',
                                maxWidth: 400,
                                textAlign: 'center'
                            }}
                        >
                            <Text size="sm" fw={700} c={classificationColor} style={{ transition: 'color 0.2s ease' }}>
                                {classificationStr}
                            </Text>
                        </Box>

                        <Box style={{ maxWidth: '100vw', overflowX: 'auto' }}>
                            <Board
                                grid={currentBoard}
                                onColumnClick={() => {}}
                                evals={evalCache[currentMoveIndex] || Array(7).fill(null)}
                                highlightCell={highlightCell}
                            />
                        </Box>

                        <Group mt="sm">
                            <Button variant="default" onClick={() => setCurrentMoveIndex(0)} disabled={currentMoveIndex === 0}>|&lt;</Button>
                            <Button variant="default" onClick={() => setCurrentMoveIndex(p => Math.max(0, p - 1))} disabled={currentMoveIndex === 0}>&lt;</Button>
                            <Button variant="default" onClick={() => setCurrentMoveIndex(p => Math.min(activeLine.length, p + 1))} disabled={currentMoveIndex === activeLine.length}>&gt;</Button>
                            <Button variant="default" onClick={() => setCurrentMoveIndex(activeLine.length)} disabled={currentMoveIndex === activeLine.length}>&gt;|</Button>
                        </Group>
                    </Stack>

                    <Box
                        w={{ base: '100%', md: 240 }}
                        style={{
                            height: 470,
                            backgroundColor: '#1c2535',
                            border: '0.5px solid #252f42',
                            borderRadius: 16,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Text size="sm" fw={500} c="#e8edf5" p="md" style={{ borderBottom: '1px solid #252f42' }}>
                            Engine Analysis
                        </Text>

                        <ScrollArea viewportRef={viewportRef} style={{ flex: 1, height: 410 }} p="md" offsetScrollbars>
                            <Stack gap="xs">
                                {activeLine.map((move, i) => {
                                    const isCurrent = (i + 1) === currentMoveIndex;

                                    const hasBeenPlayed = i < currentMoveIndex;

                                    const cachedEvals = evalCache[i];
                                    let annotation = '';
                                    let annotationColor = 'transparent';

                                    if (hasBeenPlayed && cachedEvals) {
                                        const { type } = getClassification(cachedEvals, move.col);
                                        if (type === 'Best') { annotation = '★'; annotationColor = '#10b981'; }
                                        else if (type === 'Inaccuracy') { annotation = '?!'; annotationColor = '#f59e0b'; }
                                        else if (type === 'Blunder') { annotation = '??'; annotationColor = '#ef4444'; }
                                    }

                                    return (
                                        <Group
                                            key={i}
                                            ref={(el) => { moveRefs.current[i] = el; }}
                                            wrap="nowrap"
                                            gap="sm"
                                            onClick={() => setCurrentMoveIndex(i + 1)}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                backgroundColor: isCurrent ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Text size="xs" c="#6b7a99" style={{ minWidth: 20 }}>{i + 1}.</Text>
                                            <Text size="sm" fw={500} c={move.piece === 'red' ? '#ef4444' : '#facc15'}>
                                                {String.fromCharCode(65 + move.col)}
                                            </Text>

                                            {annotation && (
                                                <Text size="xs" fw={700} c={annotationColor} ml="auto">
                                                    {annotation}
                                                </Text>
                                            )}
                                        </Group>
                                    );
                                })}
                            </Stack>
                        </ScrollArea>
                    </Box>
                </Flex>

                <Button
                    variant="outline"
                    color="gray"
                    size="md"
                    onClick={onNavigate}
                    mt="md"
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