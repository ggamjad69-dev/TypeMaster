import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/Button';
import { useParams, NavLink } from 'react-router-dom';

interface Message {
    id: number;
    content: string;
    key_id: string;
    author: string;
    recipient_id?: string;
    created_at: string;
}

const PrivateChatPage: React.FC = () => {
    const { username, activeKey, isAdmin } = useUser();
    const { showToast } = useToast();
    const { userId: targetUserParam } = useParams(); // selected user
    const [friends, setFriends] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [decryptedIds, setDecryptedIds] = useState<Set<number>>(new Set());

    // Fetch Friends (Secure Links)
    useEffect(() => {
        if (!username) return;
        fetchFriends();
        const interval = setInterval(fetchFriends, 5000); // Poll for new friends
        return () => clearInterval(interval);
    }, [username]);

    const fetchFriends = async () => {
        const { data } = await supabase.from('friendships')
            .select('*')
            .eq('status', 'accepted')
            .or(`user_a.eq.${username},user_b.eq.${username}`);

        if (data) {
            const list = data.map((f: any) => f.user_a === username ? f.user_b : f.user_a);
            setFriends(list);
        }
    };

    // Fetch messages when target changes
    useEffect(() => {
        if (targetUserParam) {
            fetchMessages(targetUserParam);
            const interval = setInterval(() => fetchMessages(targetUserParam), 3000);
            return () => clearInterval(interval);
        }
    }, [targetUserParam]);

    useEffect(() => {
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [messages]);

    const fetchMessages = async (target: string) => {
        const { data } = await supabase.from('messages')
            .select('*')
            .or(`and(author.eq.${username},recipient_id.eq.${target}),and(author.eq.${target},recipient_id.eq.${username})`)
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setMessages(data.reverse());
    };

    const sendMessage = async () => {
        if (!inputMsg.trim() || !targetUserParam || !activeKey) return;

        // Verify Friend Status (Client-side check, robust enough for demo)
        const isFriend = friends.includes(targetUserParam);
        if (!isFriend && !isAdmin) {
            showToast("Security Violation: Target is not a verified secure connection.", 'error');
            return;
        }

        const encrypted = inputMsg.split('').map(char => activeKey.map[char] || activeKey.map[char.toLowerCase()] || char).join('');

        await supabase.from('messages').insert([{
            content: encrypted,
            key_id: activeKey.id,
            author: username,
            recipient_id: targetUserParam,
            created_at: new Date().toISOString()
        }]);

        // Notify if not active?
        // Basic notification logic
        await supabase.from('notifications').insert([{
            type: 'alert',
            from_user: username,
            to_user: targetUserParam,
            content: 'sent you a private encrypted signal.',
            read: false,
            created_at: new Date().toISOString()
        }]);

        setInputMsg('');
        fetchMessages(targetUserParam);
    };

    const toggleDecrypt = (id: number) => {
        setDecryptedIds(prev => {
            const n = new Set(prev);
            if (n.has(id)) n.delete(id); else n.add(id);
            return n;
        });
    };

    const getDecrypted = (content: string, keyId: string) => {
        if (isAdmin) return content; // Admin God Mode (Simplified)
        if (!activeKey) return content;
        // Simple decryption with OWN key (assuming shared protocol or symmetric intent for demo)
        const inverse: Record<string, string> = {};
        Object.entries(activeKey.map).forEach(([k, v]) => inverse[v] = k);
        return content.split('').map(char => inverse[char] || char).join('');
    };

    // Access Control
    const canChat = targetUserParam && (friends.includes(targetUserParam) || isAdmin);

    return (
        <div className="flex h-full">
            {/* Contacts Sidebar */}
            <div className="w-64 border-r border-gray-800 bg-gray-900/30 p-4 hidden md:block">
                <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex justify-between">
                    Secure Links
                    <span className="bg-green-900 text-green-400 px-1 rounded">{friends.length}</span>
                </h2>
                <div className="space-y-2">
                    {friends.length === 0 && <p className="text-gray-600 text-xs italic">No verified links. Add friends from Public Chat.</p>}
                    {friends.map(contact => (
                        <NavLink
                            key={contact}
                            to={`/app/messages/${contact}`}
                            className={({ isActive }) => `block p-3 rounded-lg text-sm font-mono transition-colors ${isActive ? 'bg-primary-light/10 text-primary-light border border-primary-light/20 shadow-[0_0_10px_rgba(0,191,255,0.2)]' : 'text-gray-400 hover:bg-white/5'}`}
                        >
                            <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
                            {contact}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-black/50">
                {!targetUserParam ? (
                    <div className="flex-1 flex items-center justify-center text-gray-600 flex-col">
                        <div className="mb-4 text-4xl opacity-20">🛡️</div>
                        <p>Select a secured verified link to transmit.</p>
                    </div>
                ) : !canChat ? (
                    <div className="flex-1 flex items-center justify-center flex-col text-red-500">
                        <div className="mb-4 text-4xl">🚫</div>
                        <p className="font-bold">UNAUTHORIZED SIGNAL</p>
                        <p className="text-sm text-gray-500 mt-2">You have not established a secure handshake (Friendship) with {targetUserParam}.</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40 backdrop-blur">
                            <span className="font-bold text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                {targetUserParam}
                            </span>
                            <span className="text-xs text-green-500 font-mono border border-green-900 bg-green-900/20 px-2 py-1 rounded">SECURE CONNECTION VERIFIED</span>
                        </div>

                        <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.map(msg => {
                                const isMine = msg.author === username;
                                const isDecrypted = decryptedIds.has(msg.id) || isAdmin;
                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[70%] p-3 rounded-xl border ${isMine ? 'bg-primary-light/10 border-primary-light/30' : 'bg-gray-800 border-gray-700'}`}>
                                            <div className="text-[10px] text-gray-500 mb-1">{msg.key_id}</div>
                                            <div className={`font-mono break-all ${isDecrypted ? 'text-white' : 'text-primary-light blur-[0.5px]'}`}>
                                                {isDecrypted ? getDecrypted(msg.content, msg.key_id) : msg.content}
                                            </div>
                                            {!isAdmin && (
                                                <button onClick={() => toggleDecrypt(msg.id)} className="text-[10px] mt-2 underline text-gray-500 hover:text-white">
                                                    {isDecrypted ? 'Hide' : 'Translate'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex gap-2">
                            <input
                                className="flex-1 bg-black border border-gray-700 rounded p-2 text-white font-mono focus:border-primary-light outline-none"
                                value={inputMsg}
                                onChange={e => setInputMsg(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                placeholder="Type secret message..."
                            />
                            <Button size="sm" variant="primary" onClick={sendMessage}>Send</Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default PrivateChatPage;
