import React from 'react';

const BannedScreen: React.FC<{ username?: string }> = ({ username }) => {
    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center text-center p-6 bg-grid-pattern">
            <div className="absolute inset-0 bg-red-900/10 pointer-events-none animate-pulse"></div>

            <div className="card-pro max-w-lg w-full border-red-600 shadow-2xl shadow-red-900/50 p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-loading-bar"></div>

                <div className="mb-6 flex justify-center">
                    <svg className="w-24 h-24 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>

                <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">ACCESS DENIED</h1>
                <div className="text-red-500 font-mono text-xl mb-6 font-bold tracking-widest border border-red-900/50 inline-block px-4 py-1 rounded bg-red-900/20">
                    ACCOUNT SUSPENDED
                </div>

                <p className="text-gray-400 mb-8">
                    Your account <span className="text-white font-bold">{username}</span> has been flagged for violating our community safety protocols. Access to the mainframe is restricted.
                </p>

                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors w-full uppercase tracking-wider text-sm"
                >
                    Check Status
                </button>
            </div>

            <div className="mt-8 text-xs text-gray-600 font-mono">
                SYSTEM ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} <br />
                ENFORCEMENT TIMESTAMP: {new Date().toISOString()}
            </div>
        </div>
    );
};

export default BannedScreen;
