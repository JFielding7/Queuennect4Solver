import { Stack, Text, Box, Flex } from '@mantine/core';
import { Board } from '../board/Board.tsx';
import { StatusBar } from './StatusBar.tsx';
import { type MoveRecord, useGameState } from '../../hooks/useGameState.ts';
import {MoveHistorySidebar} from "./MoveHistorySidebar.tsx";
import {GameControls} from "./GameControls.tsx";


interface GamePageProps {
    onNavigateToSandbox: () => void
    onNavigateToAnalyze: (history: MoveRecord[]) => void
}

export function GamePage({ onNavigateToSandbox, onNavigateToAnalyze }: GamePageProps) {
    const { grid, status, playerOrder, winningCells, moveHistory, startGame, resetGame, handleColumnClick } = useGameState();

    const boardDisabled = status !== 'player-turn' || playerOrder === null;
    const isGameInProgress = playerOrder !== null && (status === 'player-turn' || status === 'engine-turn');

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
                </Stack>

                <StatusBar status={status} playerOrder={playerOrder} />

                <Flex direction={{ base: 'column', md: 'row' }} align="center" gap="xl">
                    <Box w={180} display={{ base: 'none', md: 'block' }} />

                    <Box style={{ maxWidth: '100vw', overflowX: 'auto', padding: '10px 0' }}>
                        <Board
                            grid={grid}
                            disabled={boardDisabled}
                            onColumnClick={handleColumnClick}
                            winningCells={winningCells}
                        />
                    </Box>

                    <MoveHistorySidebar history={moveHistory} />
                </Flex>

                <GameControls
                    isGameInProgress={isGameInProgress}
                    hasMoveHistory={moveHistory.length > 0}
                    onStartGame={startGame}
                    onResetGame={resetGame}
                    onAnalyze={() => onNavigateToAnalyze(moveHistory)}
                    onSandbox={onNavigateToSandbox}
                />
            </Stack>
        </Box>
    );
}