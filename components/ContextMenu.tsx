import React, { useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextMenuProps {
    x: number;
    y: number;
    targetUser: string;
    onClose: () => void;
    onReply?: () => void;
    onMention?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, targetUser, onClose, onReply, onMention }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { activeKey, isAdmin, username } = useUser();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { showConfirm } = useModal();

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleAddFriend = async () => {
        if (!username) return;
        if (targetUser === username) {
            showToast("You cannot add yourself as a secure node.", 'error');
            onClose();
            return;
        }

        // Check availability
        const { data, error: checkError } = await supabase.from('friendships')
            .select('*')
            .or(`and(user_a.eq.${username},user_b.eq.${targetUser}),and(user_a.eq.${targetUser},user_b.eq.${username})`)
            .maybeSingle();

        if (checkError) {
            console.error("Friendship check error:", checkError);
        }

        if (data) {
            if (data.status === 'pending') {
                if (data.user_a === username) {
                    // Resend notification
                    await supabase.from('notifications').insert([{
                        type: 'friend_req',
                        from_user: username,
                        to_user: targetUser,
                        content: 'reminds you of a secure link request.',
                        read: false,
                        created_at: new Date().toISOString()
                    }]);
                    showToast(`Resent connection signal to ${targetUser}.`, 'success');
                } else {
                    showToast(`${targetUser} is waiting for YOU. Check notifications.`, 'warning');
                }
            } else {
                showToast(`Link status: ${data.status.toUpperCase()}`, 'info');
            }
            onClose();
            return;
        }

        // Create Request
        const { error: insertError } = await supabase.from('friendships').insert([{ user_a: username, user_b: targetUser, status: 'pending' }]);

        if (insertError) {
            console.error("Friendship insert error:", insertError);
            showToast(`Failed to send signal: ${insertError.message}`, 'error');
            onClose();
            return;
        }

        // Notify Target
        await supabase.from('notifications').insert([{
            type: 'friend_req',
            from_user: username,
            to_user: targetUser,
            content: 'requests to establish a secure link.',
            read: false,
            created_at: new Date().toISOString()
        }]);

        showToast(`Friend request signal sent to ${targetUser}.`, 'success');
        onClose();
    };

    const handleReport = () => {
        const reason = prompt(`Report ${targetUser} for what reason?`);
        if (reason) {
            showToast(`Report filed against ${targetUser}. Admin notified.`, 'warning');
        }
        onClose();
    };

    const handlePrivateChat = () => {
        navigate(`/app/messages/${targetUser}`);
        onClose();
    };

    const handleBan = () => {
        // Close menu first? Or after?
        // If we close comfortably before or after, it should work.
        // Let's close it inside showConfirm logic if possible, or just let it close.
        onClose();

        // Small timeout to allow unmount to settle, though not strictly necessary in React 18 usually.
        setTimeout(() => {
            showConfirm('Confirm Ban', `Permanently ban ${targetUser}?`, async () => {
                const { error } = await supabase.from('banned_users').insert([{ username: targetUser, banned_by: username }]);

                if (error) {
                    console.error("Ban error:", error);
                    showToast(`Failed to ban ${targetUser}: ${error.code === '23505' ? 'Already banned' : 'Permission denied'}`, 'error');
                } else {
                    showToast(`${targetUser} has been wiped from the mainframe.`, 'success');
                }
            });
        }, 100);
    };

    // Position clamp
    const safeX = x > window.innerWidth - 200 ? x - 200 : x;
    const safeY = y > window.innerHeight - 300 ? y - 200 : y;

    return (
        <AnimatePresence>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed z-[9999] bg-black border border-primary-light/50 rounded-lg shadow-[0_0_20px_rgba(0,191,255,0.2)] w-52 overflow-hidden backdrop-blur-xl"
                style={{ top: safeY, left: safeX }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs text-gray-400 font-bold uppercase tracking-wider">
                    TARGET: <span className="text-white">{targetUser}</span>
                </div>

                <div className="p-1 space-y-1">
                    {onReply && (
                        <button onClick={() => { onReply(); onClose(); }} className="w-full text-left px-3 py-2 text-sm text-white font-bold hover:bg-primary-light/10 hover:text-primary-light rounded transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            Reply / Quote
                        </button>
                    )}
                    {onMention && (
                        <button onClick={() => { onMention(); onClose(); }} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-primary-light/10 hover:text-primary-light rounded transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                            Mention (@)
                        </button>
                    )}
                    <button onClick={handlePrivateChat} className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-primary-light/10 hover:text-primary-light rounded transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Private Signal
                    </button>

                    {/* Add Friend Button */}
                    <button onClick={handleAddFriend} className="w-full text-left px-3 py-2 text-sm text-green-400 hover:bg-green-900/20 hover:text-green-300 rounded transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add Secure Friend
                    </button>

                    <div className="border-t border-gray-800 my-1"></div>
                    <button onClick={handleReport} className="w-full text-left px-3 py-2 text-sm text-yellow-500 hover:bg-yellow-900/20 rounded transition-colors flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Report Activity
                    </button>

                    {isAdmin && (
                        <button onClick={handleBan} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-900/20 rounded transition-colors flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            BAN IDENTITY
                        </button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ContextMenu;
