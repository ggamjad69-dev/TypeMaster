import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import Button from '../components/Button';
import { motion } from 'framer-motion';
import ContextMenu from '../components/ContextMenu';
import { useModal } from '../context/ModalContext';

interface Post {
    id: number;
    content: string; // Encrypted
    author: string;
    key_id: string;
    created_at: string;
    reply_to_id?: number;
}

const PostsFeed: React.FC = () => {
    const { activeKey, username, isAdmin } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [decryptedPosts, setDecryptedPosts] = useState<Set<number>>(new Set());
    const [replyingTo, setReplyingTo] = useState<Post | null>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [adminKeyCache, setAdminKeyCache] = useState<Record<string, Record<string, string>>>({});
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: Post } | null>(null);

    // Modal
    const { showConfirm } = useModal();

    useEffect(() => {
        fetchPosts();
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

    const fetchPosts = async () => {
        const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
        if (data) setPosts(data);
    };

    const deletePost = (id: number) => {
        showConfirm('Delete Signal', 'Permanently delete this encrypted post?', async () => {
            await supabase.from('posts').delete().eq('id', id);
            fetchPosts();
        });
    };

    const encryptText = (text: string) => {
        if (!activeKey) return text;
        return text.split('').map(char => activeKey.map[char] || activeKey.map[char.toLowerCase()] || char).join('');
    };

    const createPost = async () => {
        if (!newPost.trim() || !activeKey) return;

        // Encrypt
        const encrypted = encryptText(newPost);

        await supabase.from('posts').insert([{
            content: encrypted,
            author: username,
            key_id: activeKey.id,
            reply_to_id: replyingTo ? replyingTo.id : null,
            created_at: new Date().toISOString()
        }]);

        // CHECK FOR MENTIONS OR REPLIES TO NOTIFY
        if (replyingTo && replyingTo.author !== username) {
            // Notify Reply Target
            await supabase.from('notifications').insert([{
                type: 'alert',
                from_user: username,
                to_user: replyingTo.author,
                content: 'replied to your encrypted signal.',
                read: false,
                created_at: new Date().toISOString()
            }]);
        }

        const mentionRegex = /@\[([a-zA-Z0-9_]+)\]/g;
        let match;
        const notifiedUsers = new Set();
        while ((match = mentionRegex.exec(newPost)) !== null) {
            const mentionedUser = match[1];
            if (mentionedUser !== username && !notifiedUsers.has(mentionedUser)) {
                notifiedUsers.add(mentionedUser);
                await supabase.from('notifications').insert([{
                    type: 'alert',
                    from_user: username,
                    to_user: mentionedUser,
                    content: 'mentioned you in a secure transmission.',
                    read: false,
                    created_at: new Date().toISOString()
                }]);
            }
        }

        setNewPost('');
        setReplyingTo(null);
        fetchPosts();
    };

    const toggleDecrypt = (id: number) => {
        setDecryptedPosts(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const getDecryptedContent = (content: string, keyId: string) => {
        if (isAdmin && adminKeyCache[keyId]) {
            const map = adminKeyCache[keyId];
            const inverse: Record<string, string> = {};
            Object.entries(map).forEach(([k, v]) => inverse[v as string] = k);
            return content.split('').map(char => inverse[char] || char).join('');
        }

        if (!activeKey) return content;
        const inverse: Record<string, string> = {};
        Object.entries(activeKey.map).forEach(([k, v]) => inverse[v] = k);
        return content.split('').map(char => inverse[char] || char).join('');
    };

    const handleMenuTrigger = (e: React.MouseEvent, msg: Post) => {
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
        if (contextMenu?.msg) {
            setNewPost(prev => `@[${contextMenu.msg.author}] ${prev}`);
            inputRef.current?.focus();
        }
        setContextMenu(null);
    };

    return (
        <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-24" onClick={() => setContextMenu(null)}>
            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    targetUser={contextMenu.msg.author}
                    onClose={() => setContextMenu(null)}
                    onReply={handleQuote}
                    onMention={handleMention}
                />
            )}

            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-white border-b border-gray-800 pb-4 flex items-center justify-between">
                    Global Encrypted Feed
                    {isAdmin && <span className="text-xs font-mono text-red-500 bg-red-900/20 px-2 py-1 rounded animate-pulse">GOD MODE ACTIVE</span>}
                </h1>

                {/* Create Post */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-10 shadow-lg">
                    {replyingTo && (
                        <div className="mb-2 p-2 rounded bg-black/40 border-l-2 border-primary-light text-xs text-gray-400 font-mono flex justify-between">
                            <div>Replying to <b>{replyingTo.author}</b>...</div>
                            <button onClick={() => setReplyingTo(null)} className="text-white">x</button>
                        </div>
                    )}
                    <textarea
                        ref={inputRef}
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        placeholder="Broadcast a secure signal..."
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-light outline-none h-24 font-mono resize-none mb-3"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Encrypted with: {activeKey?.id}</span>
                        <Button size="sm" variant="primary" onClick={createPost}>Broadcast Signal</Button>
                    </div>
                </div>

                {/* Feed */}
                <div className="space-y-6">
                    {posts.map((post, index) => {
                        const isDecrypted = decryptedPosts.has(post.id) || isAdmin; // Admin auto-decrypts
                        const isMyKey = post.key_id === activeKey?.id;

                        // TARGETED REPLY
                        const internalDecrypted = getDecryptedContent(post.content, post.key_id);
                        const isMentioned = internalDecrypted.toLowerCase().includes(`@[${username.toLowerCase()}]`);
                        const parentMsg = post.reply_to_id ? posts.find(p => p.id === post.reply_to_id) : null;
                        const isReplyToMe = parentMsg?.author === username;

                        const shouldAnimate = (isMentioned || isReplyToMe) && ((Date.now() - new Date(post.created_at).getTime()) < 10000);

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={shouldAnimate ? {
                                    opacity: 1,
                                    scale: [1, 1.02, 1],
                                    y: 0,
                                    x: [0, -5, 5, -5, 5, 0],
                                    backgroundColor: ['rgba(34, 197, 94, 0.6)', 'rgba(0, 0, 0, 1)'], // Green to Black
                                    borderColor: ['#22c55e', '#1f2937']
                                } : {
                                    opacity: 1,
                                    y: 0
                                }}
                                transition={shouldAnimate ? {
                                    duration: 2,
                                    x: { duration: 0.5 },
                                    scale: { duration: 0.5 }
                                } : {
                                    delay: index * 0.1
                                }}
                                key={post.id}
                                className={`border rounded-xl p-5 transition-all relative group 
                        ${isDecrypted ? 'bg-gray-900 border-gray-700' : 'bg-black border-gray-800'}
                        `}
                            >
                                {/* QUOTED BLOCK */}
                                {post.reply_to_id && (
                                    <div className="mb-4 p-3 rounded bg-white/5 border-l-2 border-gray-600 text-xs text-gray-400 font-mono">
                                        <div className="font-bold text-gray-500 mb-1">
                                            Replying to {parentMsg?.author || 'Unknown'}:
                                        </div>
                                        <div className="italic truncate opacity-70">
                                            {parentMsg ? getDecryptedContent(parentMsg.content, parentMsg.key_id) : '...'}
                                        </div>
                                    </div>
                                )}

                                {/* ADMIN CONTROLS */}
                                {isAdmin && (
                                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => deletePost(post.id)} className="p-1 bg-gray-800 text-gray-400 rounded hover:bg-red-600 hover:text-white">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={(e) => handleMenuTrigger(e, post)}
                                            // Trigger on click AND right click
                                            onContextMenu={(e) => handleMenuTrigger(e, post)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:ring-2 ring-primary-light ${isAdmin ? 'bg-red-600 shadow-[0_0_10px_#ff0000]' : 'bg-gradient-to-br from-gray-700 to-gray-900'}`}
                                        >
                                            {post.author.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div
                                                onClick={(e) => handleMenuTrigger(e, post)}
                                                onContextMenu={(e) => handleMenuTrigger(e, post)}
                                                className={`text-sm font-bold cursor-pointer hover:underline ${isAdmin ? 'text-red-400' : 'text-white'}`}
                                                title="Click for Options"
                                            >
                                                {post.author}
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-mono">ID: {post.key_id}</div>
                                        </div>
                                    </div>
                                    {isMyKey && !isAdmin && <div className="text-[10px] border border-green-500/50 text-green-500 px-2 py-0.5 rounded-full">MATCH</div>}
                                </div>

                                <p className={`font-mono text-lg mb-4 break-words ${isDecrypted ? 'text-white' : 'text-primary-light tracking-widest blur-[0.5px]'} ${isAdmin ? 'text-shadow-red' : ''} ${shouldAnimate ? 'text-green-400 font-bold' : ''}`}>
                                    {isDecrypted ? getDecryptedContent(post.content, post.key_id) : post.content}
                                </p>

                                {!isAdmin && (
                                    <button
                                        onClick={() => toggleDecrypt(post.id)}
                                        className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        {isDecrypted ? 'Hide Cipher' : 'Translate Signal'}
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PostsFeed;
