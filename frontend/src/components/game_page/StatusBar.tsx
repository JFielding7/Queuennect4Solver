import { Group, Box, Text } from '@mantine/core';
import type {PlayerOrder} from "../../hooks/useGameState.ts";

export type GameStatus =
    | 'player-turn'
    | 'engine-turn'
    | 'player-win'
    | 'engine-win'
    | 'draw';

const STATUS_LABEL: Record<GameStatus, string> = {
    'player-turn': '',
    'engine-turn': '',
    'player-win':  'You win!',
    'engine-win':  'Engine wins',
    'draw':        'Draw',
};

interface StatusBarProps {
    status: GameStatus;
    playerOrder: PlayerOrder | null;
}

function PlayerPill({ label, dotColor, active }: { label: string; dotColor: string; active: boolean }) {
    return (
        <Group gap={8}>
            <Box style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: dotColor }} />
            <Text size="sm" fw={active ? 500 : 400} c={active ? '#e8edf5' : '#6b7a99'}>
                {label}
            </Text>
        </Group>
    );
}

function Divider() {
    return <Box style={{ width: 1, height: 16, backgroundColor: '#252f42' }} />;
}

export function StatusBar({ status, playerOrder }: StatusBarProps) {
    const isGameInProgress = status === 'player-turn' || status === 'engine-turn';
    const playerActive = isGameInProgress || status === 'player-win' || status === 'draw';
    const engineActive = isGameInProgress || status === 'engine-win' || status === 'draw';

    const humanColor = playerOrder === 'second' ? '#facc15' : '#ef4444';
    const engineColor = playerOrder === 'second' ? '#ef4444' : '#facc15';

    return (
        <Group
            gap={12}
            style={{
                backgroundColor: '#1c2535',
                border: '0.5px solid #252f42',
                borderRadius: 12,
                padding: '10px 20px',
            }}
        >
            <PlayerPill label="You" dotColor={humanColor} active={playerActive} />

            <Divider />

            {!isGameInProgress && (
                <>
                    <Text size="sm" fw={500} c="#e8edf5">{STATUS_LABEL[status]}</Text>
                    <Divider />
                </>
            )}

            <PlayerPill label="Engine" dotColor={engineColor} active={engineActive} />
        </Group>
    );
}