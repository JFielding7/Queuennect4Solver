import { useState } from 'react';
import {Stack, Group, Button, Text, Box, ScrollArea, Flex} from '@mantine/core';
import { Board } from './Board';
import { StatusBar } from './StatusBar';
import { PlayerOrderModal } from './PlayerOrderModal';
import { useGameState } from './useGameState';

export function GamePage() {
    const { grid, status, winningCells, moveHistory, startGame, handleColumnClick } = useGameState();
    const [showModal, setShowModal] = useState(true);

    function handleNewGame() {
        setShowModal(true);
    }

    const boardDisabled = status !== 'player-turn';
    const isGameInProgress = status === 'player-turn' || status === 'engine-turn';

    const pairedMoves = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
        pairedMoves.push({
            turn: Math.floor(i / 2) + 1,
            first: moveHistory[i],
            second: moveHistory[i + 1],
        });
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
            {showModal && (
                <PlayerOrderModal
                    onChoose={(order) => {
                        setShowModal(false);
                        startGame(order);
                    }}
                />
            )}

            <Stack align="center" gap="xl">
                <Stack align="center" gap={4}>
                    <Text
                        style={{
                            fontSize: 28,
                            fontWeight: 500,
                            color: '#e8edf5',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Queuennect 4
                    </Text>
                    <Text size="sm" c="#4a5568">
                        Pieces insert from the bottom — existing pieces shift up
                    </Text>
                </Stack>

                <StatusBar status={status} />

                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    align="center"
                    gap="xl"
                >
                    <Box w={180} display={{ base: 'none', md: 'block' }} />

                    <Box style={{ maxWidth: '100vw', overflowX: 'auto', padding: '10px 0' }}>
                        <Board
                            grid={grid}
                            disabled={boardDisabled}
                            onColumnClick={handleColumnClick}
                            winningCells={winningCells}
                        />
                    </Box>

                    <Box
                        w={{ base: '100%', md: 180 }}
                        style={{
                            height: 470,
                            maxWidth: 400,
                            backgroundColor: '#1c2535',
                            border: '0.5px solid #252f42',
                            borderRadius: 16,
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <Text size="sm" fw={500} c="#e8edf5" p="md" style={{ borderBottom: '1px solid #252f42' }}>
                            Move Log
                        </Text>

                        <ScrollArea style={{ flex: 1, height: 410 }} p="md" offsetScrollbars>
                            <Stack gap="xs">
                                {pairedMoves.length === 0 ? (
                                    <Text size="xs" c="#4a5568" fs="italic">No moves yet</Text>
                                ) : (
                                    pairedMoves.map((pair, index) => (
                                        <Group key={index} wrap="nowrap" gap="sm">
                                            <Text size="xs" c="#6b7a99" style={{ minWidth: 20 }}>{pair.turn}.</Text>
                                            <Text size="sm" fw={500} style={{ width: 24, textAlign: 'center' }} c={pair.first.player === 'player' ? '#ef4444' : '#facc15'}>
                                                {String.fromCharCode(65 + pair.first.col)}
                                            </Text>
                                            {pair.second && (
                                                <Text size="sm" fw={500} style={{ width: 24, textAlign: 'center' }} c={pair.second.player === 'player' ? '#ef4444' : '#facc15'}>
                                                    {String.fromCharCode(65 + pair.second.col)}
                                                </Text>
                                            )}
                                        </Group>
                                    ))
                                )}
                            </Stack>
                        </ScrollArea>
                    </Box>
                </Flex>

                <Button
                    size="sm"
                    onClick={handleNewGame}
                    styles={{
                        root: {
                            visibility: showModal ? 'hidden' : 'visible',
                            backgroundColor: isGameInProgress ? '#ef4444' : '#1d4ed8',
                            borderColor: isGameInProgress ? '#dc2626' : '#2563eb',
                            '&:hover': {
                                backgroundColor: isGameInProgress ? '#b91c1c' : '#2563eb'
                            },
                        },
                    }}
                >
                    {isGameInProgress ? 'Rage quit' : 'New game'}
                </Button>
            </Stack>
        </Box>
    );
}