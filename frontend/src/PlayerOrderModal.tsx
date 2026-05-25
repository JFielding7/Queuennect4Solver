import { Modal, Stack, Text, Button, Group } from '@mantine/core';
import type { PlayerOrder } from './useGameState';

interface PlayerOrderModalProps {
    onChoose: (order: PlayerOrder) => void;
}

function OrderButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <Button
            onClick={onClick}
            styles={{
                root: {
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                },
            }}
        >
            {label}
        </Button>
    );
}

export function PlayerOrderModal({ onChoose }: PlayerOrderModalProps) {
    return (
        <Modal
            opened
            onClose={() => {}}
            withCloseButton={false}
            centered
            title="New game"
            styles={{
                root: { '--modal-color': '#e8edf5' },
                content: { backgroundColor: '#1c2535', border: '0.5px solid #252f42' },
                header: { backgroundColor: '#1c2535' },
                title: { color: '#e8edf5', fontWeight: 500 },
            }}
        >
            <Stack gap="md">
                <Text size="sm" c="#6b7a99">
                    Do you want to go first or second?
                </Text>
                <Group grow>
                    <OrderButton label="First" onClick={() => onChoose('first')} />
                    <OrderButton label="Second" onClick={() => onChoose('second')} />
                </Group>
            </Stack>
        </Modal>
    );
}