import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface EncryptionKey {
    id: string; // "KEY-123"
    map: Record<string, string>;
}

interface UserContextType {
    username: string | null;
    activeKey: EncryptionKey | null;
    isAdmin: boolean;
    login: (u: string, p: string) => Promise<boolean>;
    logout: () => void;
    register: (u: string, p: string) => Promise<boolean>;
    setProtocol: (k: EncryptionKey) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [username, setUsername] = useState<string | null>(localStorage.getItem('tm_user'));
    const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('tm_role') === 'admin');
    const [activeKey, setActiveKey] = useState<EncryptionKey | null>(() => {
        const saved = localStorage.getItem('tm_key');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (username) {
            checkAdminStatus(username);
        }
    }, [username]);

    const checkAdminStatus = async (user: string) => {
        // Simple check for demo or DB check
        if (user.toLowerCase() === 'amjad') { // Hardcoded admin for demo
            setIsAdmin(true);
            localStorage.setItem('tm_role', 'admin');
        } else {
            // Optional: Fetch from DB `users` table if you added is_admin column
            setIsAdmin(false);
            localStorage.setItem('tm_role', 'user');
        }
    };

    const login = async (u: string, p: string) => {
        // 1. Fetch user from DB
        const { data, error } = await supabase.from('users').select('*').eq('username', u).single();

        if (previewAdminAuth(u, p)) return true; // Legacy/Demo Admin Backdoor

        if (error || !data) return false;

        // 2. Simple password check (In prod, use hashing!)
        if (data.password === p) {
            setUsername(u);
            localStorage.setItem('tm_user', u);

            // Restore last key if exists
            if (data.last_key_id) {
                const { data: keyData } = await supabase.from('encryption_keys').select('*').eq('key_id', data.last_key_id).single();
                if (keyData) {
                    const key = { id: keyData.key_id, map: keyData.cipher_map };
                    setActiveKey(key);
                    localStorage.setItem('tm_key', JSON.stringify(key));
                }
            }
            return true;
        }
        return false;
    };

    const register = async (u: string, p: string) => {
        const { error } = await supabase.from('users').insert([{ username: u, password: p }]);
        if (!error) {
            return login(u, p);
        }
        return false;
    };

    const previewAdminAuth = (u: string, p: string) => {
        if (u === 'amjad' && p === 'n4f2s') {
            setUsername('amjad');
            setIsAdmin(true);
            localStorage.setItem('tm_user', 'amjad');
            localStorage.setItem('tm_role', 'admin');
            return true;
        }
        return false;
    };

    const logout = () => {
        setUsername(null);
        setActiveKey(null);
        setIsAdmin(false);
        localStorage.removeItem('tm_user');
        localStorage.removeItem('tm_key');
        localStorage.removeItem('tm_role');
    };

    const setProtocol = async (k: EncryptionKey) => {
        setActiveKey(k);
        localStorage.setItem('tm_key', JSON.stringify(k));
        // Persist to DB if logged in
        if (username) {
            await supabase.from('users').update({ last_key_id: k.id }).eq('username', username);
        }
    };

    return (
        <UserContext.Provider value={{ username, activeKey, isAdmin, login, logout, register, setProtocol }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};
