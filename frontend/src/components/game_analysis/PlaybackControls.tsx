import { Group, Button } from '@mantine/core';

interface PlaybackControlsProps {
    currentIndex: number;
    maxIndex: number;
    onChange: (index: number) => void;
}

export function PlaybackControls({
    currentIndex,
    maxIndex,
    onChange
}: PlaybackControlsProps) {
    return (
        <Group mt="sm">
            <Button variant="default" onClick={() => onChange(0)} disabled={currentIndex === 0}>|&lt;</Button>
            <Button variant="default" onClick={() => onChange(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>&lt;</Button>
            <Button variant="default" onClick={() => onChange(Math.min(maxIndex, currentIndex + 1))} disabled={currentIndex === maxIndex}>&gt;</Button>
            <Button variant="default" onClick={() => onChange(maxIndex)} disabled={currentIndex === maxIndex}>&gt;|</Button>
        </Group>
    );
}