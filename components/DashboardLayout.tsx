import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from './Button';

const DashboardLayout: React.FC = () => {
    const { logout, activeKey, isAdmin, username } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-cyan-500 selection:text-white relative">
            {/* Background elements */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,191,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20"></div>

            {/* Sidebar */}
            <aside className="relative z-20 w-20 md:w-72 border-r border-gray-800 flex flex-col pt-8 bg-black/60 backdrop-blur-xl shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
                <div className="px-6 mb-10 flex items-center gap-4">
                    <div className="relative">
                        <div className="w-10 h-10 bg-cyan-900/30 rounded-lg border border-cyan-500/30 flex items-center justify-center animate-pulse-glow">
                            <span className="text-xl">🛡️</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(0,255,0,0.8)]"></div>
                    </div>
                    <div className="hidden md:block">
                        <h1 className="text-xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                            Type<span className="text-cyan-500">Master</span>
                        </h1>
                        <p className="text-[9px] text-gray-500 font-mono tracking-[0.2em] uppercase">Private Network</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 px-4">
                    <NavLink to="/app/feed" className={({ isActive }) => `group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,191,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                                <svg className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,191,255,0.5)]' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                                <span className="hidden md:block font-bold tracking-wide text-sm">Encrypted Feed</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/app/chat" className={({ isActive }) => `group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,191,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                                <svg className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,191,255,0.5)]' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                                <span className="hidden md:block font-bold tracking-wide text-sm">Public Chat</span>
                            </>
                        )}
                    </NavLink>

                    <NavLink to="/app/messages" className={({ isActive }) => `group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive || location.pathname.includes('messages') ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,191,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {({ isActive }) => {
                            const active = isActive || location.pathname.includes('messages');
                            return (
                                <>
                                    {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                                    <svg className={`w-6 h-6 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,191,255,0.5)]' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                    <span className="hidden md:block font-bold tracking-wide text-sm">Private Signals</span>
                                </>
                            );
                        }}
                    </NavLink>

                    <NavLink to="/app/notifications" className={({ isActive }) => `group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,191,255,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                        {({ isActive }) => (
                            <>
                                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_10px_cyan]"></div>}
                                <svg className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,191,255,0.5)]' : 'group-hover:scale-110'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                <span className="hidden md:block font-bold tracking-wide text-sm">Notifications</span>
                            </>
                        )}
                    </NavLink>

                    {isAdmin && (
                        <NavLink to="/app/admin" className={({ isActive }) => `group flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${isActive ? 'bg-red-900/20 text-red-500 border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'text-gray-400 hover:bg-red-900/10 hover:text-red-400'}`}>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 shadow-[0_0_10px_red]"></div>}
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                    <span className="hidden md:block font-bold tracking-wide text-sm">System Admin</span>
                                </>
                            )}
                        </NavLink>
                    )}
                </nav>

                <div className="p-6 border-t border-gray-800/50 bg-black/40">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active Protocol</p>
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                        </div>
                        <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden group">
                            <span className="text-xs font-mono text-cyan-400 block truncate">{activeKey?.id || 'NO_KEY_ACTIVE'}</span>
                            <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </div>
                    </div>

                    <Button size="sm" variant="secondary" className="w-full text-xs mb-6 border border-gray-700 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-all font-mono tracking-wider" onClick={() => navigate('/setup')}>SWITCH PROTOCOL</Button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-sm border border-gray-700 text-gray-300 shadow-inner">
                            {username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 overflow-hidden hidden md:block">
                            <p className="text-sm font-bold truncate text-gray-200">{username}</p>
                            <p className="text-[9px] text-cyan-500/70 uppercase tracking-wider font-mono">Verified Account</p>
                        </div>
                        <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-full">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden bg-black/95">
                {/* Subtle spotlight effect */}
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(20,20,30,1)_0%,rgba(0,0,0,1)_50%)] pointer-events-none"></div>

                <div className="relative z-10 w-full h-full p-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
