import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Button from '../components/Button';
import { useToast } from '../context/ToastContext';
import { useModal } from '../context/ModalContext';

interface Report {
    id: number;
    reporter: string;
    reported_user: string;
    reason: string;
    time: string;
}

const AdminDashboard: React.FC = () => {
    const { showToast } = useToast();
    const { showConfirm } = useModal();
    const [stats, setStats] = useState({ users: 0, messages: 0, posts: 0, bans: 0 });
    const [bannedUsers, setBannedUsers] = useState<any[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUserToBan, setSelectedUserToBan] = useState<string | null>(null);
    const [banDuration, setBanDuration] = useState('forever');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');

    const filteredUsers = allUsers.filter(user => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const isBannedUser = bannedUsers.some(b => b.username === user.username);

        if (statusFilter === 'all') return matchesSearch;
        if (statusFilter === 'active') return matchesSearch && !isBannedUser;
        if (statusFilter === 'banned') return matchesSearch && isBannedUser;
        return matchesSearch;
    });

    // Mock reports for demonstration
    const MOCK_REPORTS: Report[] = [
        { id: 1, reporter: 'Agent_007', reported_user: 'Rogue_One', reason: 'Spamming encrypted channels', time: new Date().toISOString() },
        { id: 2, reporter: 'Cipher_X', reported_user: 'Neo_Anderson', reason: 'Attempting to breach firewall', time: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, reporter: 'Trinity', reported_user: 'Cypher', reason: 'Harassment in public chat', time: new Date(Date.now() - 7200000).toISOString() },
    ];

    useEffect(() => {
        fetchStats();
        fetchBans();
        fetchUsers();
        setReports(MOCK_REPORTS);
    }, []);

    const fetchStats = async () => {
        try {
            const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
            const { count: messages } = await supabase.from('messages').select('*', { count: 'exact', head: true });
            const { count: posts } = await supabase.from('posts').select('*', { count: 'exact', head: true });
            const { count: bans } = await supabase.from('banned_users').select('*', { count: 'exact', head: true });

            setStats({
                users: users || 0,
                messages: messages || 0,
                posts: posts || 0,
                bans: bans || 0
            });
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

    const fetchBans = async () => {
        const { data } = await supabase.from('banned_users').select('*');
        if (data) setBannedUsers(data);
    };

    const fetchUsers = async () => {
        const { data } = await supabase.from('users').select('*');
        if (data) setAllUsers(data);
    };

    const initiateBan = (username: string) => {
        setSelectedUserToBan(username);
        setShowBanModal(true);
    };

    const executeBan = async () => {
        if (!selectedUserToBan) return;

        let expiresAt = null;
        if (banDuration === '24h') {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            expiresAt = date.toISOString();
        } else if (banDuration === '7d') {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            expiresAt = date.toISOString();
        }
        // 'forever' leaves expiresAt as null

        const { error } = await supabase.from('banned_users').insert([{
            username: selectedUserToBan,
            banned_by: 'System Admin'
        }]);

        if (error) {
            console.error("Unban error:", error);
            // Check if it's an RLS policy violation (permission denied)
            if (error.code === '42501') {
                showToast("Permission Denied: You do not have authority to ban users. Check RLS policies.", 'error');
            } else if (error.code === '23505') {
                showToast(`${selectedUserToBan} is already banned.`, 'warning');
            } else {
                showToast(`Failed to ban ${selectedUserToBan}: ${error.message}`, 'error');
            }
        } else {
            showToast(`User ${selectedUserToBan} has been banned. Duration: ${banDuration}`, 'success');
        }

        // Remove from reports if applicable
        setReports(reports.filter(r => r.reported_user !== selectedUserToBan));

        setShowBanModal(false);
        setSelectedUserToBan(null);
        fetchBans();
        fetchStats();
    };

    const unbanUser = (username: string) => {
        showConfirm('Lift Sanctions', `Confirm unbanning for ${username}?`, async () => {
            console.log(`Attempting to unban: ${username}`);
            // Optimistic Update
            setBannedUsers(prev => prev.filter(b => b.username !== username));

            const { error, count } = await supabase.from('banned_users').delete({ count: 'exact' }).eq('username', username);

            if (error) {
                console.error("Unban error:", error);
                showToast(`Error lifting ban: ${error.message}`, 'error');
                fetchBans(); // Revert
            } else if (count === 0) {
                const { count: retryCount } = await supabase.from('banned_users').delete({ count: 'exact' }).eq('username', username.trim());
                if (retryCount && retryCount > 0) {
                    showToast(`Sanctions lifted for ${username}.`, 'success');
                    fetchStats();
                    return;
                }
                showToast("User not found or permission denied.", 'warning');
                fetchBans(); // Revert
            } else {
                showToast(`Sanctions lifted for ${username}.`, 'success');
                fetchStats();
            }
        });
    };

    const dismissReport = (id: number) => {
        setReports(reports.filter(r => r.id !== id));
        showToast("Report processed and dismissed.", 'info');
    };

    const isBanned = (username: string) => {
        return bannedUsers.some(b => b.username === username);
    };

    return (
        <div className="p-8 h-full overflow-y-auto bg-black/20 relative">
            <header className="mb-10 flex items-end justify-between border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">System Overview</h1>
                    <p className="text-gray-400 text-sm">Real-time network monitoring and user management.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SYSTEM ONLINE
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="card-pro p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Total Users</h3>
                        <p className="text-3xl font-bold text-white">{stats.users.toLocaleString()}</p>
                    </div>
                </div>

                <div className="card-pro p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Sent Messages</h3>
                        <p className="text-3xl font-bold text-white">{stats.messages.toLocaleString()}</p>
                    </div>
                </div>

                <div className="card-pro p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="z-10">
                        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Pending Reports</h3>
                        <p className="text-3xl font-bold text-yellow-500">{reports.length}</p>
                    </div>
                </div>

                <div className="card-pro p-6 flex flex-col justify-between h-32 relative overflow-hidden group border-red-900/30">
                    <div className="z-10">
                        <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Banned Accounts</h3>
                        <p className="text-3xl font-bold text-red-500">{stats.bans}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Reports Section */}
                <div className="card-pro p-6 border-l-4 border-l-yellow-500">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Pending User Reports
                    </h2>
                    {reports.length === 0 ? (
                        <p className="text-gray-500 text-sm">No new reports. System is clean.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-xs font-medium border-b border-gray-800">
                                        <th className="p-3">REPORTED USER</th>
                                        <th className="p-3">REPORTER</th>
                                        <th className="p-3">REASON</th>
                                        <th className="p-3">TIME</th>
                                        <th className="p-3 text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {reports.map(report => (
                                        <tr key={report.id} className="border-b border-gray-800/50 table-row-pro">
                                            <td className="p-3 font-bold text-white">{report.reported_user}</td>
                                            <td className="p-3 text-gray-400">{report.reporter}</td>
                                            <td className="p-3 text-yellow-500/80">{report.reason}</td>
                                            <td className="p-3 text-gray-500 text-xs font-mono">{new Date(report.time).toLocaleTimeString()}</td>
                                            <td className="p-3 text-right space-x-2">
                                                <Button size="sm" variant="outline" className="text-xs py-1" onClick={() => dismissReport(report.id)}>Dismiss</Button>
                                                <Button size="sm" variant="primary" className="text-xs py-1 bg-red-600 hover:bg-red-700 border-red-500" onClick={() => initiateBan(report.reported_user)}>BAN USER</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>


                <div className="card-pro p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            User Management
                        </h2>
                        <div className="flex gap-2">
                            <div className="flex bg-[#111] rounded border border-gray-800 p-0.5">
                                <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 text-xs rounded-sm transition-colors ${statusFilter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>All</button>
                                <button onClick={() => setStatusFilter('active')} className={`px-3 py-1 text-xs rounded-sm transition-colors ${statusFilter === 'active' ? 'bg-green-900/40 text-green-400' : 'text-gray-500 hover:text-gray-300'}`}>Active</button>
                                <button onClick={() => setStatusFilter('banned')} className={`px-3 py-1 text-xs rounded-sm transition-colors ${statusFilter === 'banned' ? 'bg-red-900/40 text-red-400' : 'text-gray-500 hover:text-gray-300'}`}>Banned</button>
                            </div>
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="bg-[#111] border border-gray-800 rounded px-3 py-1 text-xs text-white focus:border-blue-500 outline-none w-48"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-500 text-xs font-medium border-b border-gray-800 sticky top-0 bg-[#1c1c1c] z-10">
                                    <th className="p-4 pl-2 font-normal">USER</th>
                                    <th className="p-4 font-normal">JOINED</th>
                                    <th className="p-4 font-normal">STATUS</th>
                                    <th className="p-4 font-normal text-right">ADMIN CONTROLS</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredUsers.map(user => {
                                    const banned = isBanned(user.username);
                                    return (
                                        <tr key={user.id} className="border-b border-gray-800/50 table-row-pro">
                                            <td className="p-4 pl-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {user.username.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-white">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-400 font-mono text-xs">{new Date(user.created_at).toLocaleDateString()}</td>
                                            <td className="p-4">
                                                {banned ? (
                                                    <span className="badge badge-red">BANNED</span>
                                                ) : (
                                                    <span className="badge badge-green">ACTIVE</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <Button size="sm" variant="secondary" className="text-xs py-1 h-auto" onClick={() => showToast("Kick feature coming soon", 'info')}>Kick</Button>
                                                {banned ? (
                                                    <Button size="sm" variant="outline" className="text-xs py-1 h-auto border-green-500/50 text-green-400 hover:bg-green-500/10" onClick={() => unbanUser(user.username)}>
                                                        Unban
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="primary" className="text-xs py-1 h-auto bg-red-600/80 hover:bg-red-600 border-red-500/50" onClick={() => initiateBan(user.username)}>
                                                        Ban
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Main Table Area (Banned Users)  */}
                <div className="card-pro p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Security Enforcement Log</h2>
                    </div>

                    {bannedUsers.length === 0 ? (
                        <p className="text-gray-500 italic">No active bans in the mainframe.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-gray-500 text-xs font-medium border-b border-gray-800">
                                        <th className="p-4 pl-2 font-normal">SUBJECT</th>
                                        <th className="p-4 font-normal">ENFORCER</th>
                                        <th className="p-4 font-normal">TIMESTAMP</th>
                                        <th className="p-4 font-normal text-right">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {bannedUsers.map(ban => (
                                        <tr key={ban.username} className="border-b border-gray-800/50 table-row-pro">
                                            <td className="p-4 pl-2 font-medium text-white">{ban.username}</td>
                                            <td className="p-4 text-gray-400">{ban.banned_by}</td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{new Date(ban.created_at).toLocaleString()}</td>
                                            <td className="p-4 text-right">
                                                <Button size="sm" variant="outline" className="text-xs py-1 border-gray-700 text-gray-300 hover:bg-white/5" onClick={() => unbanUser(ban.username)}>Revoke Security Ban</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* BAN MODAL */}
            {showBanModal && selectedUserToBan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#111] border border-red-900/50 p-8 rounded-xl max-w-md w-full shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                        <h3 className="text-xl font-bold text-white mb-2">Confirm Account Suspension</h3>
                        <p className="text-gray-400 text-sm mb-6">Create a security restriction for user: <span className="text-white font-bold">{selectedUserToBan}</span></p>

                        <div className="space-y-3 mb-6">
                            <label className="block text-xs font-bold text-gray-500 uppercase">Suspension Duration</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    onClick={() => setBanDuration('24h')}
                                    className={`p-3 rounded border text-sm font-medium transition-all ${banDuration === '24h' ? 'bg-red-900/40 border-red-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                >
                                    24 Hours
                                </button>
                                <button
                                    onClick={() => setBanDuration('7d')}
                                    className={`p-3 rounded border text-sm font-medium transition-all ${banDuration === '7d' ? 'bg-red-900/40 border-red-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                >
                                    7 Days
                                </button>
                                <button
                                    onClick={() => setBanDuration('forever')}
                                    className={`p-3 rounded border text-sm font-medium transition-all ${banDuration === 'forever' ? 'bg-red-900/40 border-red-500 text-white' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
                                >
                                    Permanent
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setShowBanModal(false)}>Cancel</Button>
                            <Button variant="primary" className="flex-1 bg-red-600 hover:bg-red-700" onClick={executeBan}>EXECUTE BAN</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
