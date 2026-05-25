import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { GamePage } from './GamePage';

export default function App() {
    return (
        <MantineProvider>
            <GamePage />
        </MantineProvider>
    );
}