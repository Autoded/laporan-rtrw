'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from './supabase';
import bcrypt from 'bcryptjs';

const AuthContext = createContext(null);

// localStorage key for current user
const CURRENT_USER_KEY = 'rtrw_current_user';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            // Check localStorage for current user
            const storedUser = localStorage.getItem(CURRENT_USER_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error('Error reading user from localStorage:', e);
        }
        setIsLoading(false);
    };

    const login = async (email, password) => {
        if (isSupabaseEnabled()) {
            // Query user from Supabase
            const { data: foundUser, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error || !foundUser) {
                throw new Error('Email tidak terdaftar');
            }

            // Verify password with bcrypt
            if (!foundUser.password_hash) {
                throw new Error('Akun belum memiliki password. Silakan hubungi admin.');
            }

            const isPasswordValid = await bcrypt.compare(password, foundUser.password_hash);
            if (!isPasswordValid) {
                throw new Error('Password salah');
            }

            const userWithoutPassword = {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email,
                phone: foundUser.phone,
                address: foundUser.address,
                role: foundUser.role,
                createdAt: foundUser.created_at,
            };

            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
            setUser(userWithoutPassword);
            return userWithoutPassword;
        }

        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('rtrw_users') || '[]');
        const foundUser = users.find(u => u.email === email);

        if (!foundUser) {
            throw new Error('Email tidak terdaftar');
        }

        if (foundUser.password !== password) {
            throw new Error('Password salah');
        }

        const userWithoutPassword = { ...foundUser };
        delete userWithoutPassword.password;

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        return userWithoutPassword;
    };

    const register = async (userData) => {
        if (isSupabaseEnabled()) {
            // Check if email already exists
            const { data: existingUser } = await supabase
                .from('users')
                .select('id')
                .eq('email', userData.email)
                .single();

            if (existingUser) {
                throw new Error('Email sudah terdaftar');
            }

            // Hash password with bcrypt
            const passwordHash = await bcrypt.hash(userData.password, 10);

            // Insert new user with hashed password
            const { data: newUser, error } = await supabase
                .from('users')
                .insert([{
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    address: userData.address,
                    role: 'warga',
                    password_hash: passwordHash,
                }])
                .select()
                .single();

            if (error) {
                console.error('Register error:', error);
                throw new Error('Gagal mendaftar: ' + error.message);
            }

            const userWithoutPassword = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                address: newUser.address,
                role: newUser.role,
                createdAt: newUser.created_at,
            };

            // Don't auto-login, just return the user data
            return userWithoutPassword;
        }

        // localStorage fallback
        const users = JSON.parse(localStorage.getItem('rtrw_users') || '[]');
        const existingUser = users.find(u => u.email === userData.email);

        if (existingUser) {
            throw new Error('Email sudah terdaftar');
        }

        const newUser = {
            id: 'USR-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
            ...userData,
            role: 'warga',
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem('rtrw_users', JSON.stringify(users));

        const userWithoutPassword = { ...newUser };
        delete userWithoutPassword.password;

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        return userWithoutPassword;
    };

    const logout = () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        setUser(null);
    };

    const isAdmin = user?.role === 'admin' || user?.role === 'ketua_rt';
    const isKetuaRT = user?.role === 'ketua_rt';

    // Don't render children until mounted to prevent hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            isAdmin,
            isKetuaRT,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
