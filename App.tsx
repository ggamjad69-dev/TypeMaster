import { supabase } from './lib/supabase';

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CodeSelectionPage from './pages/CodeSelectionPage';
import DashboardLayout from './components/DashboardLayout';
import PostsFeed from './pages/PostsFeed';
import PublicChat from './components/PublicChat';
import NotificationsPage from './pages/NotificationsPage';
import PrivateChatPage from './pages/PrivateChatPage';
import AdminDashboard from './pages/AdminDashboard';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import BannedScreen from './components/BannedScreen';

// Ban Check Component
const BanCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { username } = useUser();
    const [isBanned, setIsBanned] = React.useState(false);

    React.useEffect(() => {
        if (!username) return;

        const checkBan = async () => {
            const { data } = await supabase.from('banned_users').select('*').eq('username', username).maybeSingle();
            setIsBanned(!!data);
        };

        checkBan();

        // Realtime Subscription
        const channel = supabase.channel('banned_users_check')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'banned_users' },
                (payload) => {
                    // Check if the change affects THIS user
                    const newRecord = payload.new as { username?: string };
                    const oldRecord = payload.old as { username?: string };

                    if ((newRecord && newRecord.username === username) ||
                        (oldRecord && oldRecord.username === username)) {
                        checkBan();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [username]);

    if (isBanned) return <BannedScreen username={username || 'Unknown'} />;

    return <>{children}</>;
};

// Protected Route Component
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { username } = useUser();
    if (!username) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

// Admin Route Component
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { username, isAdmin } = useUser();
    if (!username || !isAdmin) {
        return <Navigate to="/app/feed" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <ThemeProvider>
                <ToastProvider>
                    <ModalProvider>
                        <BanCheck>
                            <Routes>
                                <Route path="/" element={<LoginPage />} />
                                <Route path="/login" element={<LoginPage />} />

                                {/* Protected Routes */}
                                <Route path="/setup" element={<RequireAuth><CodeSelectionPage /></RequireAuth>} />

                                <Route path="/app" element={<RequireAuth><DashboardLayout /></RequireAuth>}>
                                    <Route index element={<Navigate to="feed" replace />} />
                                    <Route path="feed" element={<PostsFeed />} />
                                    <Route path="chat" element={<div className="h-full pt-4"><PublicChat /></div>} />
                                    <Route path="notifications" element={<NotificationsPage />} />
                                    <Route path="messages" element={<PrivateChatPage />} />
                                    <Route path="messages/:userId" element={<PrivateChatPage />} />

                                    <Route path="admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
                                </Route>
                                {/* Fallback */}
                                <Route path="*" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </BanCheck>
                    </ModalProvider>
                </ToastProvider>
            </ThemeProvider>
        </UserProvider>
    );
};

export default App;
