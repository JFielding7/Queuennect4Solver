import {Box, Button, SegmentedControl, Stack, Text} from "@mantine/core";

interface SandboxControlsProps {
    paintMode: 'red' | 'yellow' | 'alternate';
    onPaintModeChange: (mode: 'red' | 'yellow' | 'alternate') => void;
    currentTurn: 'red' | 'yellow';
    onTurnChange: (turn: 'red' | 'yellow') => void;
    onEvaluate: () => void;
    isEvaluating: boolean;
    onClear: () => void;
}

export function SandboxControls({
    paintMode,
    onPaintModeChange,
    currentTurn,
    onTurnChange,
    onEvaluate,
    isEvaluating,
    onClear
}: SandboxControlsProps) {
    return (
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
                        onChange={(v) => onPaintModeChange(v as 'red' | 'yellow' | 'alternate')}
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
                        onChange={(v) => onTurnChange(v as 'red' | 'yellow')}
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
                    onClick={onEvaluate}
                    loading={isEvaluating}
                >
                    Get Evaluations
                </Button>

                <Button
                    fullWidth
                    variant="outline"
                    color="gray"
                    onClick={onClear}
                >
                    Clear Board
                </Button>
            </Stack>
        </Box>
    );
}
