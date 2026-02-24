'use client';

interface HeaderProps {
  isConnected: boolean;
  isLoading: boolean;
  isAgentActive: boolean;
  onToggleAgent: (active: boolean) => void;
  agentLoading: boolean;
}

export default function Header({ isConnected, isAgentActive, onToggleAgent, agentLoading }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl sm:text-5xl font-extrabold italic gold-gradient-text">
          SETTER IA.
        </h1>
        <p className="text-taupe mt-1 text-sm sm:text-base">
          By Aser
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Temps réel indicator */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-beige rounded-full">
          <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
          <span className="text-sm font-medium text-brown">
            {isConnected ? 'Temps Réel' : 'Erreur'}
          </span>
        </div>

        {/* Toggle Agent IA global */}
        <button
          onClick={() => onToggleAgent(!isAgentActive)}
          disabled={agentLoading}
          className={`
            flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer
            ${agentLoading ? 'opacity-60 cursor-wait' : ''}
            ${isAgentActive
              ? 'bg-green-50 border-green-300 hover:bg-green-100'
              : 'bg-red-50 border-red-300 hover:bg-red-100'
            }
          `}
        >
          {/* Toggle switch */}
          <div className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${isAgentActive ? 'bg-green-500' : 'bg-red-400'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${isAgentActive ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
          </div>
          <span className={`text-sm font-semibold ${isAgentActive ? 'text-green-700' : 'text-red-600'}`}>
            {agentLoading ? '...' : isAgentActive ? 'Agent IA ON' : 'Agent IA OFF'}
          </span>
        </button>
      </div>
    </header>
  );
}
