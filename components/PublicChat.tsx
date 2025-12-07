import React, { useState, useEffect, useRef, useCallback } from 'react';
import Button from './Button';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import ContextMenu from './ContextMenu';
import { motion, AnimatePresence } from 'framer-motion';
import { useModal } from '../context/ModalContext';

interface Message {
    id: number;
    content: string;
    key_id: string;
    author?: string;
    created_at: string;
    reply_to_id?: number;
}

const PublicChat: React.FC = () => {
    const { activeKey, username, isAdmin } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const [sending, setSending] = useState(false);
    const [decryptedIds, setDecryptedIds] = useState<Set<number>>(new Set());
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [adminKeyCache, setAdminKeyCache] = useState<Record<string, Record<string, string>>>({});

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: Message } | null>(null);
    const [inverseMap, setInverseMap] = useState<Record<string, string>>({});

    // Modal
    const { showConfirm } = useModal();

    // Scroll & Unread Logic
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    if (!activeKey) return <div className="text-white p-10">Error: No Secure Protocol Active</div>;

    const currentMap = activeKey.map;
    const currentKeyId = activeKey.id;

    useEffect(() => {
        if (currentMap) {
            const inv: Record<string, string> = {};
            Object.entries(currentMap).forEach(([k, v]) => inv[v] = k);
            setInverseMap(inv);
        }
    }, [currentMap]);

    useEffect(() => {
        if (isAdmin) fetchAllKeys();
    }, [isAdmin]);

    const fetchAllKeys = async () => {
        const { data } = await supabase.from('encryption_keys').select('key_id, cipher_map');
        if (data) {
            const cache: Record<string, Record<string, string>> = {};
            data.forEach((k: any) => cache[k.key_id] = k.cipher_map);
            setAdminKeyCache(cache);
        }
    };

    const getInverseMapForMsg = (msgKeyId: string) => {
        if (msgKeyId === currentKeyId) return inverseMap;
        if (isAdmin && adminKeyCache[msgKeyId]) {
            const inv: Record<string, string> = {};
            Object.entries(adminKeyCache[msgKeyId]).forEach(([k, v]) => inv[v as string] = k);
            return inv;
        }
        return null;
    };

    const decryptMessage = (encrypted: string, msgKeyId: string) => {
        const inv = getInverseMapForMsg(msgKeyId);
        if (!inv) return encrypted;

        return encrypted.split('').map(char => {
            // Direct match
            if (inv[char]) return inv[char];

            // Try lowercase match
            const lower = char.toLowerCase();
            if (inv[lower]) {
                const decrypted = inv[lower];
                // If original was Upper, make result Upper
                return (char === char.toUpperCase() && char !== char.toLowerCase())
                    ? decrypted.toUpperCase()
                    : decrypted;
            }
            return char;
        }).join('');
    };

    const toggleTranslation = (id: number) => {
        setDecryptedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const fetchMessages = async () => {
        const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50);
        if (data) {
            const reversedData = data.reverse();
            setMessages(prev => {
                // Unread logic
                if (prev.length > 0 && reversedData.length > prev.length) {
                    const newMsgsCount = reversedData.length - prev.length;
                    // Only increment if NOT at bottom
                    // We need to check ref current scroll state ideally, but state is okay for now
                    if (!isAtBottom) {
                        setUnreadCount(c => c + newMsgsCount);
                    }
                }
                return reversedData;
            });
        }
    };

    useEffect(() => {
        // Initial fetch
        const loadInitial = async () => {
            // Fetch keys immediately if admin
            if (isAdmin) fetchAllKeys();

            const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(50);
            if (data) {
                setMessages(data.reverse());
                // Initial scroll to bottom
                setTimeout(scrollToBottom, 100);
            }
        };
        loadInitial();

        const msgInterval = setInterval(fetchMessages, 3000);

        // Poll for keys every 10s (Admin only)
        let keyInterval: NodeJS.Timeout;
        if (isAdmin) {
            keyInterval = setInterval(fetchAllKeys, 10000);
        }

        return () => {
            clearInterval(msgInterval);
            if (keyInterval) clearInterval(keyInterval);
        };
    }, [isAdmin]);

    // Scroll Handling
    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;

        // Tolerance of 50px
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(atBottom);
        setShowScrollButton(!atBottom);

        if (atBottom) {
            setUnreadCount(0);
        }
    };

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
            setUnreadCount(0);
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        if (isAtBottom && chatContainerRef.current) {
            // Use minimal timeout to allow render
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                }
            }, 50);
        }
    }, [messages, isAtBottom]);

    const encryptText = (text: string) => {
        return text.split('').map(char => currentMap[char] || currentMap[char.toLowerCase()] || char).join('');
    };

    const sendMessage = async () => {
        if (!inputMsg.trim()) return;
        setSending(true);

        const encryptedContent = encryptText(inputMsg);

        try {
            await supabase.from('messages').insert([{
                content: encryptedContent,
                key_id: currentKeyId,
                author: username,
                reply_to_id: replyingTo ? replyingTo.id : null,
                created_at: new Date().toISOString()
            }]);

            // NOTIFICATIONS LOGIC
            // ... (omitted for brevity, same as before)

            setInputMsg('');
            setReplyingTo(null);

            // Force scroll to bottom on own send
            setIsAtBottom(true);
            setTimeout(scrollToBottom, 100);

            fetchMessages();
        } catch (err) {
            console.error("Error sending:", err);
        } finally {
            setSending(false);
        }
    };

    const deleteMessage = (id: number) => {
        showConfirm('Delete Transmission', 'Permanently delete this secure signal?', async () => {
            await supabase.from('messages').delete().eq('id', id);
            fetchMessages();
        });
    };

    const handleMenuTrigger = (e: React.MouseEvent, msg: Message) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, msg });
    };

    const handleQuote = () => {
        if (contextMenu?.msg) {
            setReplyingTo(contextMenu.msg);
            inputRef.current?.focus();
        }
        setContextMenu(null);
    };

    const handleMention = () => {
        if (contextMenu?.msg.author) {
            setInputMsg(prev => `@[${contextMenu.msg.author}] ${prev}`);
            inputRef.current?.focus();
        }
        setContextMenu(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden" id="chat" onClick={() => setContextMenu(null)}>
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary-light/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px]"></div>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetUser={contextMenu.msg.author || 'Unknown'}
                    onClose={() => setContextMenu(null)}
                    onReply={handleQuote}
                    onMention={handleMention}
                />
            )}

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-6 py-4 bg-black/60 backdrop-blur-md border-b border-white/5 flex justify-between items-center shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Public Secure Channel
                    </h2>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">Protocol: <span className="text-primary-light">{currentKeyId}</span></p>
                </div>
                {isAdmin && <div className="text-red-500 font-bold bg-red-900/20 text-[10px] tracking-widest border border-red-500/50 px-2 py-1 rounded">ADMIN OVERRIDE</div>}
            </div>

            {/* Messages Area */}
            <div
                ref={chatContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 pt-24 pb-32 space-y-6 custom-scrollbar scroll-smooth"
            >
                <div className="text-center text-gray-700 text-xs font-mono mb-8 uppercase tracking-widest opacity-50">
                    -- Encrypted Connection Established --
                </div>

                {messages.length === 0 ? <div className="text-center text-gray-600 mt-20 animate-pulse">Scanning for signals...</div> : messages.map((msg, index) => {
                    // ... (Rendering logic remains the same)
                    const isMine = msg.author === username;
                    const isTranslated = decryptedIds.has(msg.id) || isAdmin;

                    const internalDecrypted = decryptMessage(msg.content, msg.key_id);
                    const isMentioned = internalDecrypted.toLowerCase().includes(`@[${username.toLowerCase()}]`);
                    const isReplyToMe = msg.reply_to_id && messages.find(m => m.id === msg.reply_to_id)?.author === username;
                    const isFresh = (Date.now() - new Date(msg.created_at).getTime()) < 10000;

                    const shouldAnimate = (isMentioned || isReplyToMe) && isFresh;

                    const displayContent = isTranslated ? internalDecrypted : msg.content;
                    const isAdminMsg = msg.author?.toLowerCase() === 'amjad' || msg.author === 'System Admin';
                    const msgAuthor = msg.author || 'Unknown';

                    const parentMsg = msg.reply_to_id ? messages.find(m => m.id === msg.reply_to_id) : null;

                    return (
                        <div key={msg.id} className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} group pointer-events-none`}>
                            <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'} pointer-events-auto`}>

                                {/* Avatar */}
                                <div className="flex-shrink-0 pt-1">
                                    <div
                                        onClick={(e) => handleMenuTrigger(e, msg)}
                                        onContextMenu={(e) => handleMenuTrigger(e, msg)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-transform hover:scale-105 shadow-lg
                                        ${isAdminMsg ? 'bg-gradient-to-br from-red-600 to-red-900 ring-1 ring-red-500' :
                                                isMine ? 'bg-gradient-to-br from-primary-light via-teal-600 to-teal-800 text-white' :
                                                    'bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700'}`}
                                    >
                                        {msgAuthor.substring(0, 2).toUpperCase()}
                                    </div>
                                </div>

                                {/* Bubble Content */}
                                <div className="flex flex-col min-w-0">
                                    {!isMine && <div className="text-[10px] text-gray-500 ml-1 mb-1 font-bold">{msgAuthor}</div>}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`relative px-4 py-3 shadow-md backdrop-blur-sm border
                                        ${isMine
                                                ? 'bg-gradient-to-br from-[#1a2e26] to-[#0f1f1a] border-primary-light/30 rounded-2xl rounded-tr-sm text-right'
                                                : 'bg-white/5 border-white/10 rounded-2xl rounded-tl-sm text-left'}
                                        ${isAdminMsg ? 'bg-red-950/30 border-red-500/50' : ''}
                                        ${shouldAnimate ? 'ring-2 ring-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : ''}
                                        `}
                                    >
                                        {/* QUOTED BLOCK */}
                                        {msg.reply_to_id && (
                                            <div className={`mb-2 p-2 rounded text-[10px] font-mono border-l-2
                                                ${isMine ? 'bg-black/20 border-primary-light/50 text-right' : 'bg-black/20 border-gray-500 text-left'}`}>
                                                <div className="opacity-70 mb-0.5">Replying to {parentMsg?.author || 'Unknown'}:</div>
                                                <div className="opacity-50 truncate italic max-w-[200px]">
                                                    {parentMsg ? (decryptMessage(parentMsg.content, parentMsg.key_id)) : '...'}
                                                </div>
                                            </div>
                                        )}

                                        <div className={`font-mono text-sm md:text-base break-words leading-relaxed
                                            ${isAdminMsg ? 'text-red-400 font-bold' :
                                                isTranslated ? 'text-white' : 'text-primary-light/80 tracking-widest blur-[0.4px]'}
                                        `}>
                                            {displayContent}
                                        </div>

                                        <div className={`flex items-center gap-2 mt-2 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                            {!isAdmin && (
                                                <button onClick={() => toggleTranslation(msg.id)}
                                                    className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full transition-all 
                                                    ${isTranslated
                                                            ? 'bg-white/10 text-gray-400 hover:bg-white/20'
                                                            : 'bg-primary-light/10 text-primary-light hover:bg-primary-light hover:text-black'}`}>
                                                    {isTranslated ? 'Raw' : 'Cipher'}
                                                </button>
                                            )}
                                            <span className="text-[9px] text-gray-600 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>

                                        {isAdmin && (
                                            <button onClick={() => deleteMessage(msg.id)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-75 hover:scale-100 shadow-md">
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating Scroll Button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        onClick={scrollToBottom}
                        className="absolute bottom-24 right-6 z-40 w-10 h-10 bg-gray-900/80 backdrop-blur border border-primary-light/30 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors group"
                    >
                        <svg className="w-5 h-5 text-primary-light group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce shadow-md">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Floating Input Area */}
            <div className="absolute bottom-6 left-0 w-full px-4 md:px-0 flex justify-center z-30">
                <div className="w-full max-w-3xl bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/5 flex flex-col transition-all focus-within:ring-primary-light/50 focus-within:border-primary-light/30 focus-within:shadow-[0_0_30px_rgba(0,0,0,0.5)]">

                    {replyingTo && (
                        <div className="bg-gray-800/50 px-4 py-2 flex justify-between items-center text-xs border-b border-gray-700">
                            <span className="text-gray-300 truncate">Replying to <span className="text-primary-light font-bold">{replyingTo.author}</span></span>
                            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white">✕</button>
                        </div>
                    )}

                    <div className="flex items-center p-2 gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputMsg}
                            onChange={(e) => setInputMsg(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Broadcast secure signal..."
                            className="flex-1 bg-transparent border-none text-white px-3 py-2 focus:ring-0 placeholder-gray-600 font-mono text-sm h-10"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={sending || !inputMsg.trim()}
                            className={`p-2 rounded-xl transition-all flex items-center justify-center
                            ${inputMsg.trim()
                                    ? 'bg-primary-light text-black hover:bg-white shadow-[0_0_10px_rgba(34,197,94,0.4)] transform hover:scale-105'
                                    : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}
                        >
                            <svg className="w-5 h-5 -rotate-45 relative left-[-1px] top-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Encryption Key Indicator (Floating) */}
            <div className="absolute bottom-8 right-8 text-[10px] text-gray-700 font-mono pointer-events-none hidden md:block">
                SECURE_CHANNEL_V2 // ID: {currentKeyId}
            </div>

        </div>
    );
};

export default PublicChat;
