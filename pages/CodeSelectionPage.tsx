import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { motion } from 'framer-motion';

const CodeSelectionPage: React.FC = () => {
    const { setProtocol, activeKey, username } = useUser();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState(false);

    // generate random key map
    const generateKey = () => {
        const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const shuffled = alphabet.split('').sort(() => 0.5 - Math.random()).join('');
        const map: Record<string, string> = {};
        for (let i = 0; i < alphabet.length; i++) {
            map[alphabet[i]] = shuffled[i];
        }
        return map;
    };

    const handleCreate = async () => {
        setLoading(true);
        const newMap = generateKey();
        const keyId = `KEY-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error } = await supabase.from('encryption_keys').insert([{ key_id: keyId, cipher_map: newMap }]);

        if (!error) {
            setProtocol({ id: keyId, map: newMap });
            navigate('/app/feed');
        } else {
            showToast('Error creating protocol', 'error');
        }
        setLoading(false);
    };

    const handleJoin = async () => {
        if (!joinCode) return;
        setLoading(true);
        const { data, error } = await supabase.from('encryption_keys').select('*').eq('key_id', joinCode).single();

        if (data && !error) {
            setProtocol({ id: data.key_id, map: data.cipher_map });
            navigate('/app/feed');
        } else {
            showToast('Protocol Invalid or Expired', 'error');
        }
        setLoading(false);
    };

    return (
        <div className="h-screen w-full bg-black flex items-center justify-center p-6 bg-cover">
            <div className="max-w-2xl w-full">
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl md:text-6xl font-bold text-center mb-4 text-white uppercase tracking-tighter"
                >
                    Protocol <span className="text-primary-light">Selection</span>
                </motion.h1>

                {/* ACTIVE KEY INFO */}
                {activeKey && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gray-900/80 border border-green-500/30 p-6 rounded-xl mb-8 text-center"
                    >
                        <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">Current Active Protocol</p>
                        <div className="text-3xl font-mono text-green-400 font-bold mb-4">{activeKey.id}</div>
                        <Button size="lg" variant="primary" onClick={() => navigate('/app/feed')} className="w-full md:w-auto bg-green-600 hover:bg-green-500 border-none">
                            CONTINUE WITH CURRENT PROTOCOL
                        </Button>
                    </motion.div>
                )}

                <p className="text-gray-500 text-center mb-12 font-mono">
                    {activeKey ? "Or switch to a different frequency:" : "Initialize your encryption standards to proceed to the network."}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                        onClick={handleCreate}
                        disabled={loading}
                        className="group relative p-8 bg-gray-900 border border-gray-800 hover:border-primary-light rounded-xl transition-all text-left"
                    >
                        <div className="absolute inset-0 bg-primary-light/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                        <div className="text-2xl text-white font-bold mb-2 group-hover:text-primary-light">Generation</div>
                        <p className="text-gray-500 text-sm">Create a new unique encryption protocol. You will be the host.</p>
                    </button>

                    <div className="p-8 bg-gray-900 border border-gray-800 rounded-xl">
                        <div className="text-2xl text-white font-bold mb-4">Synchronization</div>
                        <p className="text-gray-500 text-sm mb-4">Join an existing protocol using a Key ID.</p>
                        <div className="flex gap-2">
                            <input
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="KEY-XXXX"
                                className="flex-1 bg-black border border-gray-700 rounded px-3 py-2 text-white font-mono uppercase focus:border-primary-light outline-none"
                            />
                            <Button size="sm" variant="primary" onClick={handleJoin} disabled={loading}>{loading ? '...' : 'SYNC'}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CodeSelectionPage;
