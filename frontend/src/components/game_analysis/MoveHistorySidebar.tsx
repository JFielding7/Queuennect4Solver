import {useEffect, useRef} from "react";
import {Box, Button, Group, ScrollArea, Stack, Text} from "@mantine/core";
import {gridToFlatString, type MoveRecord} from "../../hooks/useGameState.ts";
import type {CellState} from "../board/Cell.tsx";
import {getClassification} from "./MoveClassification.ts";

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
                        {activeLine.map((move, i) => {
                            const isCurrent = (i + 1) === currentMoveIndex;
                            const boardStrAtMove = gridToFlatString(boardStates[i]);
                            const cachedEvals = evalCache[boardStrAtMove];

                            let annotation = '';
                            let annotationColor = 'transparent';

                            if (cachedEvals) {
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
                                    onClick={() => onMoveClick(i + 1)}
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