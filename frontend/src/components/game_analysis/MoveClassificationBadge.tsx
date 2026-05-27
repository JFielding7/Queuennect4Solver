import {Box, Text} from "@mantine/core";

interface MoveClassificationBadgeProps {
    text: string;
    color: string;
}

export function MoveClassificationBadge({ text, color }: MoveClassificationBadgeProps) {
    return (
        <Box
            style={{
                backgroundColor: '#1c2535',
                border: `1px solid ${color}`,
                borderRadius: 8,
                padding: '6px 16px',
                minHeight: 34,
                transition: 'border-color 0.2s ease',
                maxWidth: 400,
                textAlign: 'center'
            }}
        >
            <Text size="sm" fw={700} c={color} style={{ transition: 'color 0.2s ease' }}>
                {text}
            </Text>
        </Box>
    );
}
