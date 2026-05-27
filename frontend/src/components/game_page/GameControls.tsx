import {type PlayerOrder} from "../../hooks/useGameState.ts";
import {Box, Button, Divider, Group, Stack, Text} from "@mantine/core";

interface GameControlsProps {
    isGameInProgress: boolean;
    hasMoveHistory: boolean;
    onStartGame: (order: PlayerOrder) => void;
    onResetGame: () => void;
    onAnalyze: () => void;
    onSandbox: () => void;
}

export function GameControls({
    isGameInProgress,
    hasMoveHistory,
    onStartGame,
    onResetGame,
    onAnalyze,
    onSandbox
}: GameControlsProps) {
    return (
        <Stack align="center" gap="md" mt="sm">
            {isGameInProgress ? (
                <Button variant="outline" color="red" size="sm" onClick={onResetGame}>
                    Rage quit
                </Button>
            ) : (
                <Stack align="center" gap="md">
                    {hasMoveHistory && (
                        <>
                            <Button color="indigo" onClick={onAnalyze}>
                                Analyze Game
                            </Button>

                            <Box style={{ width: '100%', minWidth: 250 }}>
                                <Divider color="#252f42" />
                            </Box>
                        </>
                    )}

                    <Stack align="center" gap="xs">
                        <Text size="xs" fw={600} c="#6b7a99" style={{ textTransform: 'uppercase' }}>
                            Start New Game
                        </Text>
                        <Group>
                            <Button
                                color="red"
                                onClick={() => onStartGame('first')}
                                styles={{ root: { backgroundColor: '#ef4444', color: '#ffffff' } }}
                            >
                                Play First (Red)
                            </Button>
                            <Button
                                color="yellow"
                                onClick={() => onStartGame('second')}
                                styles={{ root: { backgroundColor: '#facc15', color: '#000000' } }}
                            >
                                Play Second (Yellow)
                            </Button>
                        </Group>
                    </Stack>
                </Stack>
            )}

            <Box style={{ width: '100%', maxWidth: 300, padding: '12px 0' }}>
                <Divider color="#252f42" />
            </Box>

            <Button
                variant="outline"
                color="gray"
                size="md"
                onClick={onSandbox}
                styles={{
                    root: {
                        borderColor: '#4a5568',
                        color: '#e8edf5',
                        '&:hover': { backgroundColor: '#1c2535' }
                    }
                }}
            >
                Enter Engine Sandbox
            </Button>
        </Stack>
    );
}