import { useState, useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import type { AppState, ActiveView, OutputLayout, ScenarioInput, PreparedFor, QuoteResult, LoanOfficerInfo } from './types';
import { emptyScenario } from './types';
import { calculateQuote } from './utils/calculations';
import ScenarioInputsPage from './components/ScenarioInputs/ScenarioInputsPage';
import QuoteBuilderPage from './components/QuoteOutput/QuoteBuilderPage';
import PrintLayout from './components/QuoteOutput/PrintLayout/PrintLayout';
import EmailLayout from './components/QuoteOutput/EmailLayout/EmailLayout';
import RentCastPage from './components/RentCast/RentCastPage';
import { sendQuoteToClient } from './utils/sendToClient';

const ACCESS_CODE = 'TQLROCKS';

function AccessGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (code.toUpperCase().trim() === ACCESS_CODE) {
      sessionStorage.setItem('cq_access', '1');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-monarch-bg flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-sm w-full text-center">
        <img src="/clear-quote-logo.png" alt="Clear Quote" className="h-32 mx-auto mb-6" />
        <p className="text-xs text-monarch-muted uppercase tracking-widest mb-6">Enter Access Code</p>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Access Code"
          className={`w-full px-4 py-3 text-center text-lg font-semibold tracking-widest border-2 rounded-lg outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-monarch-border focus:border-monarch-navy'
          }`}
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mt-2">Invalid code. Try again.</p>}
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 bg-monarch-navy text-white font-semibold rounded-lg hover:bg-monarch-navy/90 transition-colors"
        >
          Enter
        </button>
        <p className="text-[10px] text-monarch-muted mt-6">Powered by TQL</p>
      </div>
    </div>
  );
}

function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('cq_access') === '1');
  const [state, setState] = useState<AppState>({
    activeView: 'inputs',
    outputLayout: 'screen',
    emailScenarioIndex: 0,
    preparedFor: { name: '', email: '', phone: '' },
    loanOfficer: { name: '', date: new Date().toISOString().split('T')[0], nmlsNumber: '', phone: '', email: '', title: 'Loan Officer & Advisor' },
    scenarios: [emptyScenario()],
  });

  const printRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef: printRef });

  const handleScenarioChange = useCallback((idx: number, field: keyof ScenarioInput, value: unknown) => {
    setState(prev => {
      const scenarios = [...prev.scenarios];
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

  const handleLoanOfficerChange = useCallback((field: keyof LoanOfficerInfo, value: string) => {
    setState(prev => ({
      ...prev,
      loanOfficer: { ...prev.loanOfficer, [field]: value },
    }));
  }, []);

  const handleAddScenario = useCallback(() => {
    setState(prev => {
      if (prev.scenarios.length >= 3) return prev;
      return { ...prev, scenarios: [...prev.scenarios, emptyScenario()] };
    });
  }, []);

  const handleRemoveScenario = useCallback((idx: number) => {
    setState(prev => {
      if (prev.scenarios.length <= 1) return prev;
      const scenarios = prev.scenarios.filter((_, i) => i !== idx);
      return {
        ...prev,
        scenarios,
        emailScenarioIndex: Math.min(prev.emailScenarioIndex, scenarios.length - 1),
      };
    });
  }, []);

  const results: QuoteResult[] = state.scenarios.map(s => calculateQuote(s));

  if (!unlocked) return <AccessGate onUnlock={() => setUnlocked(true)} />;

  const setView = (v: ActiveView) => setState(prev => ({ ...prev, activeView: v }));
  const setLayout = (v: OutputLayout) => setState(prev => ({ ...prev, outputLayout: v }));

  return (
    <div className="min-h-screen bg-monarch-bg">
      {/* Top Nav */}
      <nav className="bg-gray-200 text-monarch-navy no-print sticky top-0 z-50 border-b border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <img src="/tql-logo.png" alt="Total Quality Lending" className="h-8" />
              <div className="leading-none">
                <span className="text-monarch-navy font-bold text-sm tracking-tight">CLEAR QUOTE</span>
                <br/><span className="text-monarch-navy/50 text-[9px] italic">Clarity in the Costs&trade;</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setView('inputs')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  state.activeView === 'inputs'
                    ? 'bg-monarch-navy text-white'
                    : 'text-monarch-navy/60 hover:text-monarch-navy hover:bg-black/5'
                }`}
              >
                Scenario Inputs
              </button>
              <button
                onClick={() => setView('quote')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  state.activeView === 'quote'
                    ? 'bg-monarch-navy text-white'
                    : 'text-monarch-navy/60 hover:text-monarch-navy hover:bg-black/5'
                }`}
              >
                Clear Quote
              </button>
              <button
                onClick={() => setView('rentcast')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  state.activeView === 'rentcast'
                    ? 'bg-monarch-navy text-white'
                    : 'text-monarch-navy/60 hover:text-monarch-navy hover:bg-black/5'
                }`}
              >
                RentCast
              </button>

              {state.activeView === 'quote' && (
                <>
                  <div className="w-px h-6 bg-monarch-navy/20 mx-2" />
                  <button
                    onClick={() => setLayout('screen')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'screen' ? 'bg-monarch-gold text-monarch-navy' : 'text-monarch-navy/60 hover:text-monarch-navy'
                    }`}
                  >
                    Screen
                  </button>
                  <button
                    onClick={() => setLayout('print')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'print' ? 'bg-monarch-gold text-monarch-navy' : 'text-monarch-navy/60 hover:text-monarch-navy'
                    }`}
                  >
                    Print PDF
                  </button>
                  <button
                    onClick={() => setLayout('email')}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                      state.outputLayout === 'email' ? 'bg-monarch-gold text-monarch-navy' : 'text-monarch-navy/60 hover:text-monarch-navy'
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
                    <>
                      <select
                        value={state.emailScenarioIndex}
                        onChange={e => setState(prev => ({ ...prev, emailScenarioIndex: parseInt(e.target.value) }))}
                        className="ml-2 px-2 py-1.5 text-xs bg-white text-monarch-navy border border-gray-300 rounded"
                      >
                        {state.scenarios.map((_, i) => (
                          <option key={i} value={i} className="text-black">Scenario {i + 1}</option>
                        ))}
                      </select>
                      <button
                        onClick={async () => {
                          const res = await sendQuoteToClient(results[state.emailScenarioIndex], state.preparedFor, state.loanOfficer);
                          alert(res.message);
                        }}
                        className="ml-2 px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700 transition-colors"
                      >
                        Send to Client
                      </button>
                    </>
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
            loanOfficer={state.loanOfficer}
            onScenarioChange={handleScenarioChange}
            onPreparedForChange={handlePreparedForChange}
            onLoanOfficerChange={handleLoanOfficerChange}
            onAddScenario={handleAddScenario}
            onRemoveScenario={handleRemoveScenario}
          />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'screen' && (
          <QuoteBuilderPage results={results} preparedFor={state.preparedFor} loanOfficer={state.loanOfficer} onLoanOfficerChange={handleLoanOfficerChange} />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'print' && (
          <PrintLayout ref={printRef} results={results} preparedFor={state.preparedFor} loanOfficer={state.loanOfficer} />
        )}

        {state.activeView === 'quote' && state.outputLayout === 'email' && (
          <EmailLayout
            result={results[state.emailScenarioIndex]}
            preparedFor={state.preparedFor}
            loanOfficer={state.loanOfficer}
            scenarioIndex={state.emailScenarioIndex}
          />
        )}

        {state.activeView === 'rentcast' && (
          <RentCastPage scenarios={state.scenarios} />
        )}
      </main>
    </div>
  );
}

export default App;
