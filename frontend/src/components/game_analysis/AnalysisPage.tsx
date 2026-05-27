import { useState, useMemo, useEffect } from 'react';
import { Stack, Button, Text, Box, Flex } from '@mantine/core';
import { Board } from '../board/Board.tsx';
import {
    emptyGrid,
    playPiece,
    gridToFlatString,
    checkConnect4,
    isBoardFull,
    isGameOver, COLS
} from '../../hooks/useGameState.ts';
import type { MoveRecord } from '../../hooks/useGameState.ts';
import type { CellState } from "../board/Cell.tsx";
import { MoveClassificationBadge } from "./MoveClassificationBadge.tsx";
import { PlaybackControls } from "./PlaybackControls.tsx";
import { getClassification } from "./MoveClassification.ts";
import { MoveHistorySidebar } from "./MoveHistorySidebar.tsx";

interface AnalysisPageProps {
    initialHistory: MoveRecord[];
    onNavigate: () => void;
}

export function AnalysisPage({ initialHistory, onNavigate }: AnalysisPageProps) {
    const [activeLine, setActiveLine] = useState<MoveRecord[]>(initialHistory);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
    const [divergenceIndex, setDivergenceIndex] = useState<number | null>(null);

    const [evalCache, setEvalCache] = useState<Record<string, (number | null)[]>>({});
    const [fetching, setFetching] = useState<Set<string>>(new Set());

    const boardStates = useMemo(() => {
        const states = [emptyGrid()];
        for (let i = 0; i < activeLine.length; i++) {
            const next = playPiece(states[i], activeLine[i].col, activeLine[i].piece);
            states.push(next || states[i]);
        }
        return states;
    }, [activeLine]);

    const currentBoard = boardStates[currentMoveIndex];
    const isExploring = activeLine !== initialHistory;

    const isFullyEvaluated = useMemo(() => {
        for (const boardObj of boardStates) {
            if (isGameOver(boardObj)) {
                continue;
            }
            const boardStr = gridToFlatString(boardObj);
            if (!evalCache[boardStr]) {
                return false;
            }
        }
        return true;
    }, [boardStates, evalCache]);

    function handleBoardClick(col: number) {
        if (isGameOver(currentBoard)) return;

        const nextPiece: CellState = currentMoveIndex % 2 === 0 ? 'red' : 'yellow';

        const nextBoard = playPiece(currentBoard, col, nextPiece);
        if (!nextBoard) return;

        if (!isExploring) {
            setDivergenceIndex(currentMoveIndex);
        }

        const branchedLine = [
            ...activeLine.slice(0, currentMoveIndex),
            { by: 'player', piece: nextPiece, col }
        ] as MoveRecord[];

        setActiveLine(branchedLine);
        setCurrentMoveIndex(currentMoveIndex + 1);
    }

    function handleReturnToMainLine() {
        setActiveLine(initialHistory);
        setCurrentMoveIndex(divergenceIndex !== null ? divergenceIndex : 0);
        setDivergenceIndex(null);
    }

    useEffect(() => {
        const fetchMissingPositions = async () => {
            const missingPayload = [];
            const missingStrs: string[] = [];

            for (const boardObj of boardStates) {
                if (isGameOver(boardObj)) {
                    continue;
                }

                const boardStr = gridToFlatString(boardObj);
                if (!evalCache[boardStr] && !fetching.has(boardStr)) {
                    missingPayload.push({ board: boardStr });
                    missingStrs.push(boardStr);
                }
            }

            if (missingPayload.length === 0) return;

            setFetching(prev => new Set([...prev, ...missingStrs]));

            try {
                const res = await fetch('http://localhost:8080/api/evaluate_all_boards', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(missingPayload),
                });

                if (res.ok) {
                    const data: (number | null)[][] = await res.json();
                    setEvalCache(prev => {
                        const next = { ...prev };
                        missingStrs.forEach((str, i) => {
                            next[str] = data[i];
                        });
                        return next;
                    });
                } else {
                    console.error("Failed to batch evaluate:", await res.text());
                }
            } catch (e) {
                console.error(e);
            } finally {
                setFetching(prev => {
                    const next = new Set(prev);
                    missingStrs.forEach(str => next.delete(str));
                    return next;
                });
            }
        };

        fetchMissingPositions();
    }, [boardStates]);

    let classificationStr = 'Starting Position';
    let classificationColor = '#6b7a99';
    let highlightCell: { col: number; row: number; color: string } | undefined = undefined;

    if (currentMoveIndex > 0) {
        const prevIdx = currentMoveIndex - 1;
        const playedMove = activeLine[prevIdx];
        const prevBoardStr = gridToFlatString(boardStates[prevIdx]);
        const previousEvals = evalCache[prevBoardStr];

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

            let redConnect4 = checkConnect4(currentBoard, 'red');
            let yellowConnect4 = checkConnect4(currentBoard, 'yellow');

            if (redConnect4 && !yellowConnect4) {
                classificationStr += '. Red won.';
            } else if (!redConnect4 && yellowConnect4) {
                classificationStr += '. Yellow won.';
            } else if ((redConnect4 && yellowConnect4) || isBoardFull(currentBoard)) {
                classificationStr += ". It's a draw.";
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
                    {isExploring && (
                        <Text size="sm" c="#f59e0b" fw={600}>
                            Exploring Alternative Line
                        </Text>
                    )}
                </Stack>

                <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="center" gap="xl" w="100%">
                    <Box w={240} display={{ base: 'none', md: 'block' }} />

                    <Stack align="center" gap="xs">
                        <MoveClassificationBadge text={classificationStr} color={classificationColor} />

                        <Box style={{ maxWidth: '100vw', overflowX: 'auto' }}>
                            <Board
                                grid={currentBoard}
                                onColumnClick={handleBoardClick}
                                evals={evalCache[gridToFlatString(currentBoard)] || Array(COLS).fill(null)}
                                highlightCell={highlightCell}
                            />
                        </Box>

                        <Box style={{ minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isFullyEvaluated ? (
                                <PlaybackControls
                                    currentIndex={currentMoveIndex}
                                    maxIndex={activeLine.length}
                                    onChange={setCurrentMoveIndex}
                                />
                            ) : (
                                <Text size="sm" c="#6b7a99" mt="sm">
                                    Preparing Analysis...
                                </Text>
                            )}
                        </Box>
                    </Stack>

                    <MoveHistorySidebar
                        activeLine={activeLine}
                        currentMoveIndex={currentMoveIndex}
                        boardStates={boardStates}
                        evalCache={evalCache}
                        isExploring={isExploring}
                        onMoveClick={setCurrentMoveIndex}
                        onReturnToMainLine={handleReturnToMainLine}
                    />
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
                    Return to Home
                </Button>
            </Stack>
        </Box>
    );
}