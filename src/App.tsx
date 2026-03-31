import { useState, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { AppState, ActiveView, OutputLayout, ScenarioInput, PreparedFor, QuoteResult } from './types';
import { emptyScenario } from './types';
import { calculateQuote } from './utils/calculations';
import ScenarioInputsPage from './components/ScenarioInputs/ScenarioInputsPage';
import QuoteBuilderPage from './components/QuoteOutput/QuoteBuilderPage';
import PrintLayout from './components/QuoteOutput/PrintLayout/PrintLayout';
import EmailLayout from './components/QuoteOutput/EmailLayout/EmailLayout';

function App() {
  const [state, setState] = useState<AppState>({
    activeView: 'inputs',
    outputLayout: 'screen',
    emailScenarioIndex: 0,
    preparedFor: { name: '', email: '', phone: '' },
    scenarios: [emptyScenario(), emptyScenario(), emptyScenario()],
  });

  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  const handleScenarioChange = useCallback((idx: number, field: keyof ScenarioInput, value: unknown) => {
    setState(prev => {
      const scenarios = [...prev.scenarios] as [ScenarioInput, ScenarioInput, ScenarioInput];
      scenarios[idx] = { ...scenarios[idx], [field]: value };
      return { ...prev, scenarios };
    });
  }, []);

  const handlePreparedForChange = useCallback((field: keyof PreparedFor, value: string) => {
    setState(prev => ({
      ...prev,
      preparedFor: { ...prev.preparedFor, [field]: value },
    }));
  }, []);

  const results: [QuoteResult, QuoteResult, QuoteResult] = [
    calculateQuote(state.scenarios[0]),
    calculateQuote(state.scenarios[1]),
    calculateQuote(state.scenarios[2]),
  ];

  const setView = (v: ActiveView) => setState(prev => ({ ...prev, activeView: v }));
  const setLayout = (v: OutputLayout) => setState(prev => ({ ...prev, outputLayout: v }));

  return (
    <div className="min-h-screen bg-monarch-bg">
      {/* Top Nav */}
      <nav className="bg-monarch-navy text-white no-print sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-1">
              <span className="text-monarch-gold font-bold text-lg tracking-tight">TQL</span>
              <span className="text-white/80 text-sm font-light">Quote Builder</span>
            </div>
            <div className="flex items-center gap-1">
              {/* Page Tabs */}
              <button
                onClick={() => setView('inputs')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  state.activeView === 'inputs'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Scenario Inputs
              </button>
              <button
                onClick={() => setView('quote')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  state.activeView === 'quote'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                Quote Builder
              </button>

              {state.activeView === 'quote' && (
                <>
                  <div className="w-px h-6 bg-white/20 mx-2" />
                  {/* Layout Switcher */}
                  <button
                    onClick={() => setLayout('screen')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'screen' ? 'bg-monarch-gold text-monarch-navy' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Screen
                  </button>
                  <button
                    onClick={() => setLayout('print')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'print' ? 'bg-monarch-gold text-monarch-navy' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Print PDF
                  </button>
                  <button
                    onClick={() => setLayout('email')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'email' ? 'bg-monarch-gold text-monarch-navy' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Email
                  </button>

                  {state.outputLayout === 'print' && (
                    <button
                      onClick={() => reactToPrintFn()}
                      className="ml-2 px-4 py-1.5 bg-monarch-gold text-monarch-navy text-xs font-bold rounded hover:bg-monarch-gold/90 transition-colors"
                    >
                      Print / Save PDF
                    </button>
                  )}

                  {state.outputLayout === 'email' && (
                    <select
                      value={state.emailScenarioIndex}
                      onChange={e => setState(prev => ({ ...prev, emailScenarioIndex: parseInt(e.target.value) }))}
                      className="ml-2 px-2 py-1.5 text-xs bg-white/10 text-white border border-white/20 rounded"
                    >
                      <option value={0} className="text-black">Scenario 1</option>
                      <option value={1} className="text-black">Scenario 2</option>
                      <option value={2} className="text-black">Scenario 3</option>
                    </select>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {state.activeView === 'inputs' && (
          <ScenarioInputsPage
            scenarios={state.scenarios}
            preparedFor={state.preparedFor}
            onScenarioChange={handleScenarioChange}
            onPreparedForChange={handlePreparedForChange}
          />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'screen' && (
          <QuoteBuilderPage results={results} preparedFor={state.preparedFor} />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'print' && (
          <PrintLayout ref={printRef} results={results} preparedFor={state.preparedFor} />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'email' && (
          <EmailLayout
            result={results[state.emailScenarioIndex]}
            preparedFor={state.preparedFor}
            scenarioIndex={state.emailScenarioIndex}
          />
        )}
      </main>
    </div>
  );
}

export default App;
