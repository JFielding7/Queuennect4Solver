import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { GamePage } from './GamePage';
import { SandboxPage } from './SandboxPage';
import { AnalysisPage } from './AnalysisPage';
import type { MoveRecord } from './useGameState';

type ViewState =
    | { page: 'game' }
    | { page: 'sandbox' }
    | { page: 'analyze', history: MoveRecord[] };

export default function App() {
    const [view, setView] = useState<ViewState>({ page: 'game' });

    return (
        <MantineProvider>
            {view.page === 'game' && (
                <GamePage
                    onNavigateToSandbox={() => setView({ page: 'sandbox' })}
                    onNavigateToAnalyze={(history) => setView({ page: 'analyze', history })}
                />
            )}
            {view.page === 'sandbox' && (
                <SandboxPage onNavigate={() => setView({ page: 'game' })} />
            )}
            {view.page === 'analyze' && (
                <AnalysisPage
                    initialHistory={view.history}
                    onNavigate={() => setView({ page: 'game' })}
                />
            )}
        </MantineProvider>
    );
}