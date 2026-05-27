import { useEffect, useRef } from "react";
import { Box, Button, Group, ScrollArea, Stack, Text, Flex } from "@mantine/core";
import { gridToFlatString, type MoveRecord } from "../../hooks/useGameState.ts";
import type { CellState } from "../board/Cell.tsx";
import { getClassification } from "./MoveClassification.ts";

interface MoveHistorySidebarProps {
    activeLine: MoveRecord[];
    currentMoveIndex: number;
    boardStates: CellState[][][];
    evalCache: Record<string, (number | null)[]>;
    isExploring: boolean;
    onMoveClick: (index: number) => void;
    onReturnToMainLine: () => void;
}

export function MoveHistorySidebar({
    activeLine,
    currentMoveIndex,
    boardStates,
    evalCache,
    isExploring,
    onMoveClick,
    onReturnToMainLine
}: MoveHistorySidebarProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const moveRefs = useRef<(HTMLDivElement | null)[]>([]);

    const pairedMoves = [];
    for (let i = 0; i < activeLine.length; i += 2) {
        pairedMoves.push({
            turnIndex: Math.floor(i / 2),
            turnNumber: Math.floor(i / 2) + 1,
            firstMove: activeLine[i],
            firstMoveGlobalIndex: i,
            secondMove: activeLine[i + 1],
            secondMoveGlobalIndex: i + 1,
        });
    }

    useEffect(() => {
        if (currentMoveIndex === 0) {
            viewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const activeTurnRowIndex = Math.floor((currentMoveIndex - 1) / 2);
            moveRefs.current[activeTurnRowIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [currentMoveIndex]);

    const getAnnotationProps = (globalIndex: number, move: MoveRecord) => {
        const boardStrAtMove = gridToFlatString(boardStates[globalIndex]);
        const cachedEvals = evalCache[boardStrAtMove];

        let annotation = '';
        let annotationColor = 'transparent';

        if (cachedEvals) {
            const { type } = getClassification(cachedEvals, move.col);
            if (type === 'Best') { annotation = '★'; annotationColor = '#10b981'; }
            else if (type === 'Inaccuracy') { annotation = '?!'; annotationColor = '#f59e0b'; }
            else if (type === 'Blunder') { annotation = '??'; annotationColor = '#ef4444'; }
        }

        return { annotation, annotationColor };
    };

    return (
        <Stack w={{ base: '100%', md: 240 }} gap="sm">
            <Box
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
                    {isExploring ? 'Variant Analysis' : 'Engine Analysis'}
                </Text>

                <ScrollArea viewportRef={viewportRef} style={{ flex: 1, height: 410 }} p="md" offsetScrollbars>
                    <Stack gap="xs">
                        {pairedMoves.map((pair, rowIdx) => {
                            const isFirstCurrent = (pair.firstMoveGlobalIndex + 1) === currentMoveIndex;
                            const isSecondCurrent = pair.secondMove && (pair.secondMoveGlobalIndex + 1) === currentMoveIndex;

                            const firstAnnotation = getAnnotationProps(pair.firstMoveGlobalIndex, pair.firstMove);
                            const secondAnnotation = pair.secondMove ? getAnnotationProps(pair.secondMoveGlobalIndex, pair.secondMove) : null;

                            return (
                                <Flex
                                    key={rowIdx}
                                    ref={(el) => { moveRefs.current[rowIdx] = el; }}
                                    align="center"
                                    gap="xs"
                                >
                                    <Text size="xs" c="#6b7a99" style={{ minWidth: 24 }}>
                                        {pair.turnNumber}.
                                    </Text>

                                    <Group
                                        wrap="nowrap"
                                        gap={4}
                                        onClick={() => onMoveClick(pair.firstMoveGlobalIndex + 1)}
                                        style={{
                                            flex: 1,
                                            padding: '4px 8px',
                                            borderRadius: 6,
                                            backgroundColor: isFirstCurrent ? 'rgba(255,255,255,0.1)' : 'transparent',
                                            cursor: 'pointer',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Text size="sm" fw={500} c={pair.firstMove.piece === 'red' ? '#ef4444' : '#facc15'}>
                                            {String.fromCharCode(65 + pair.firstMove.col)}
                                        </Text>
                                        {firstAnnotation.annotation && (
                                            <Text size="xs" fw={700} c={firstAnnotation.annotationColor}>
                                                {firstAnnotation.annotation}
                                            </Text>
                                        )}
                                    </Group>

                                    {pair.secondMove ? (
                                        <Group
                                            wrap="nowrap"
                                            gap={4}
                                            onClick={() => onMoveClick(pair.secondMoveGlobalIndex + 1)}
                                            style={{
                                                flex: 1,
                                                padding: '4px 8px',
                                                borderRadius: 6,
                                                backgroundColor: isSecondCurrent ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                cursor: 'pointer',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Text size="sm" fw={500} c={pair.secondMove.piece === 'red' ? '#ef4444' : '#facc15'}>
                                                {String.fromCharCode(65 + pair.secondMove.col)}
                                            </Text>
                                            {secondAnnotation?.annotation && (
                                                <Text size="xs" fw={700} c={secondAnnotation.annotationColor}>
                                                    {secondAnnotation.annotation}
                                                </Text>
                                            )}
                                        </Group>
                                    ) : (
                                        <Box style={{ flex: 1 }} />
                                    )}
                                </Flex>
                            );
                        })}
                    </Stack>
                </ScrollArea>
            </Box>

            {isExploring && (
                <Button
                    variant="light"
                    color="indigo"
                    size="sm"
                    onClick={onReturnToMainLine}
                >
                    Return to Main Game
                </Button>
            )}
        </Stack>
    );
}