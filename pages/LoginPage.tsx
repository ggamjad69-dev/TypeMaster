import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
    const { login, register } = useUser();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError("All fields required");
            setLoading(false);
            return;
        }

        const success = isLogin
            ? await login(username, password)
            : await register(username, password);

        if (success) {
            navigate('/setup');
        } else {
            setError(isLogin ? "Invalid credentials" : "User already exists");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-black text-white font-sans selection:bg-cyan-500 selection:text-white">
            {/* Animated Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(rgba(0,191,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,191,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,191,255,0.1)_0%,rgba(0,0,0,1)_80%)]"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-md p-8 glass-panel rounded-xl relative"
            >
                {/* Decorative Elements */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-lg"></div>
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-lg"></div>

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-black rounded-full border border-cyan-500/50 shadow-[0_0_20px_rgba(0,191,255,0.3)] flex items-center justify-center mb-4 animate-pulse-glow">
                        <span className="text-4xl filter drop-shadow-[0_0_5px_rgba(0,191,255,0.8)]">🛡️</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                        TYPEMASTER
                    </h1>
                    <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest mt-1">SECURE ENCRYPTED NETWORK</p>
                </div>

                <div className="flex mb-8 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all duration-300 ${isLogin ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
                    >
                        LOGIN
                    </button>
                    <button
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 py-2 text-xs font-bold tracking-wider rounded-md transition-all duration-300 ${!isLogin ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,191,255,0.4)]' : 'text-gray-500 hover:text-white'}`}
                    >
                        REGISTER
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-2 ml-1">Operative Alias</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-white px-4 py-3 rounded-lg font-mono text-sm input-cyber placeholder-gray-600"
                            placeholder="ENTER_IDENTITY_Protocol::v2"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-cyan-500/80 uppercase tracking-widest mb-2 ml-1">Secure Passkey</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full text-white px-4 py-3 rounded-lg font-mono text-sm input-cyber placeholder-gray-600"
                            placeholder="••••••••••••"
                        />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-mono text-center"
                        >
                            ⚠ ERROR: {error.toUpperCase()}
                        </motion.div>
                    )}

                    <Button
                        size="lg"
                        variant="primary"
                        className="w-full justify-center group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 border border-cyan-400/30"
                        disabled={loading}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? 'PROCESSING...' : (isLogin ? 'AUTHENTICATE' : 'ESTABLISH IDENTITY')}
                            {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                        </span>
                    </Button>
                </form>
            </motion.div>

            <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-[9px] text-gray-700 font-mono tracking-[0.3em]">SYSTEM_VERSION_2.0.4 // ENCRYPTED_CONNECTION_ESTABLISHED</p>
            </div>
        </div>
    );
};

export default LoginPage;
