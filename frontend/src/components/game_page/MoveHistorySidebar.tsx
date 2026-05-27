import type {MoveRecord} from "../../hooks/useGameState.ts";
import {Box, Group, ScrollArea, Stack, Text} from "@mantine/core";

export function MoveHistorySidebar({ history }: { history: MoveRecord[] }) {
    const pairedMoves = [];
    for (let i = 0; i < history.length; i += 2) {
        pairedMoves.push({
            turn: Math.floor(i / 2) + 1,
            first: history[i],
            second: history[i + 1],
        });
    }

    return (
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
                Move History
            </Text>

            <ScrollArea style={{ flex: 1, height: 410 }} p="md" offsetScrollbars>
                <Stack gap="xs">
                    {pairedMoves.map((pair, index) => (
                        <Group key={index} wrap="nowrap" gap="sm">
                            <Text size="xs" c="#6b7a99" style={{ minWidth: 20 }}>{pair.turn}.</Text>

                            <Text size="sm" fw={500} style={{ width: 24, textAlign: 'center' }} c={pair.first.piece === 'red' ? '#ef4444' : '#facc15'}>
                                {String.fromCharCode(65 + pair.first.col)}
                            </Text>

                            {pair.second && (
                                <Text size="sm" fw={500} style={{ width: 24, textAlign: 'center' }} c={pair.second.piece === 'red' ? '#ef4444' : '#facc15'}>
                                    {String.fromCharCode(65 + pair.second.col)}
                                </Text>
                            )}
                        </Group>
                    ))}
                </Stack>
            </ScrollArea>
        </Box>
    );
}
