import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { GamePage } from './components/game_page/GamePage.tsx';
import { SandboxPage } from './components/sandbox/SandboxPage.tsx';
import { AnalysisPage } from './components/game_analysis/AnalysisPage.tsx';
import type { MoveRecord } from './hooks/useGameState.ts';

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