import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
    id: number;
    type: 'alert' | 'friend_req' | 'mention' | 'reply'; // Types
    from_user: string;
    to_user: string;
    content: string;
    read: boolean;
    created_at: string;
    payload?: any; // e.g., link to post
}

const NotificationsPage: React.FC = () => {
    const { username } = useUser();
    const { showToast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!username) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 5000);
        return () => clearInterval(interval);
    }, [username]);

    const fetchNotifications = async () => {
        const { data } = await supabase.from('notifications')
            .select('*')
            .eq('to_user', username)
            .order('created_at', { ascending: false });
        if (data) setNotifications(data);
    };

    const markAsRead = async (id: number) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        fetchNotifications();
    };

    const deleteNotification = async (id: number) => {
        await supabase.from('notifications').delete().eq('id', id);
        fetchNotifications();
    };

    const handleAcceptFriend = async (notif: Notification) => {
        // Update friendship status to 'accepted'
        // Assuming friendship record exists and we can find it by users
        // Query: user_a = from_user, user_b = me OR user_a = me, user_b = from_user
        const { error } = await supabase.from('friendships')
            .update({ status: 'accepted' })
            .or(`and(user_a.eq.${notif.from_user},user_b.eq.${username}),and(user_a.eq.${username},user_b.eq.${notif.from_user})`);

        if (!error) {
            showToast(`Link established with ${notif.from_user}.`, 'success');
            deleteNotification(notif.id);
        } else {
            console.error(error);
            showToast('Error accepting connection.', 'error');
        }
    };

    return (
        <div className="p-6 md:p-12 text-white pb-24 h-full overflow-y-auto custom-scrollbar">
            <h1 className="text-3xl font-bold mb-8 border-b border-gray-800 pb-4 flex justify-between items-center">
                System Notifications
                <span className="text-xs font-mono bg-primary-light/10 text-primary-light px-2 py-1 rounded">
                    {notifications.length} Signals
                </span>
            </h1>

            <div className="space-y-4 max-w-3xl mx-auto">
                {notifications.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        No new signals received.
                    </div>
                )}

                <AnimatePresence>
                    {notifications.map(notif => (
                        <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`p-4 rounded-xl border flex items-start gap-4 transition-colors relative group
                                ${notif.type === 'friend_req' ? 'bg-primary-light/5 border-primary-light/30' :
                                    notif.read ? 'bg-black border-gray-800 opacity-50' : 'bg-gray-900 border-gray-700'}`}
                        >
                            <button
                                onClick={() => deleteNotification(notif.id)}
                                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                x
                            </button>

                            {/* Icon based on type */}
                            <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center border
                                ${notif.type === 'friend_req' ? 'border-primary-light text-primary-light' :
                                    notif.type === 'alert' ? 'border-red-500 text-red-500' :
                                        'border-gray-500 text-gray-500'}`}>
                                {notif.type === 'friend_req' ? (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-sm mb-1 uppercase tracking-wider text-gray-300">
                                        {notif.type === 'friend_req' ? 'Connection Request' : 'Transmission Alert'}
                                    </h3>
                                    <span className="text-[10px] text-gray-600 font-mono">
                                        {new Date(notif.created_at).toLocaleTimeString()}
                                    </span>
                                </div>

                                <p className="text-gray-400 text-sm mb-3">
                                    <span className="text-white font-bold">{notif.from_user}</span> {notif.content}
                                </p>

                                {notif.type === 'friend_req' && !notif.read && (
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" variant="primary" onClick={() => handleAcceptFriend(notif)}>
                                            Accept Protocol
                                        </Button>
                                        <button
                                            onClick={() => deleteNotification(notif.id)}
                                            className="px-4 py-2 rounded text-xs font-bold bg-gray-800 text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default NotificationsPage;
