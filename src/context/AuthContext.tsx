import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../utils/supabaseService';
import type { User, Session } from '@supabase/supabase-js';

export interface CustomerProfile {
    id: string;
    company_name: string;
    industry: string | null;
    logo_url: string | null;
    ai_prompt_prefix: string;
    is_admin?: boolean;
    role?: 'admin' | 'client' | 'content_creator';
    phone?: string;
    website?: string;
    address?: string;
    social_accounts?: Record<string, string>;
    brand_guidelines?: string;
    assigned_clients?: string[];
    created_at: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    customerProfile: CustomerProfile | null;
    isAdmin: boolean;
    isContentCreator: boolean;
    userRole: 'admin' | 'client' | 'content_creator';
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    register: (email: string, password: string, companyName: string, industry?: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<CustomerProfile>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch customer profile from Supabase
    const fetchCustomerProfile = useCallback(async (userId: string) => {
        if (!userId) return null;
        try {
            console.log('fetchCustomerProfile attempt for:', userId);
            const { data, error } = await supabase
                .from('customer_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Ignore AbortError and known cancellation signals
                if (error.message?.includes('AbortError') || error.code === 'ABORTED' || error.message?.includes('signal is aborted')) {
                    console.log('Fetch aborted, ignoring.');
                    return null;
                }
                console.error('Error fetching profile:', error.message);
                return null;
            }
            console.log('Profile data received, is_admin:', data?.is_admin);
            return data as CustomerProfile;
        } catch (err: unknown) {
            if (err instanceof Error && err.name === 'AbortError') return null;
            console.error('Unexpected profile error:', err);
            return null;
        }
    }, []);

    // Initialize auth state
    useEffect(() => {
        let isMounted = true;
        let authSubscription: { unsubscribe: () => void } | null = null;

        const initialize = async () => {
            console.log('Auth initialization started');
            try {
                // Get initial session
                const { data: { session: initSession }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (isMounted) {
                    setSession(initSession);
                    setUser(initSession?.user ?? null);

                    if (initSession?.user) {
                        const profile = await fetchCustomerProfile(initSession.user.id);
                        if (isMounted) setCustomerProfile(profile);
                    }
                }

                // Listen for changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
                    console.log('Auth event transition:', event);
                    if (!isMounted) return;

                    setSession(newSession);
                    setUser(newSession?.user ?? null);

                    if (newSession?.user) {
                        const profile = await fetchCustomerProfile(newSession.user.id);
                        if (isMounted) setCustomerProfile(profile);
                    } else {
                        setCustomerProfile(null);
                    }
                });

                authSubscription = subscription;
            } catch (err) {
                console.error('Auth init sequence error:', err);
            } finally {
                if (isMounted) {
                    console.log('Auth initialization finished');
                    setIsLoading(false);
                }
            }
        };

        initialize();

        return () => {
            isMounted = false;
            if (authSubscription) {
                authSubscription.unsubscribe();
            }
        };
    }, [fetchCustomerProfile]);

    const login = useCallback(async (email: string, password: string) => {
        console.log('Manual login attempt for:', email);
        try {
            setIsLoading(true);
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                setIsLoading(false);
                return { error: error.message };
            }

            // pre-fetch for immediate feedback
            if (data.user) {
                const profile = await fetchCustomerProfile(data.user.id);
                setCustomerProfile(profile);
            }

            return { error: null };
        } catch {
            return { error: 'Giriş işlemi başarısız oldu.' };
        } finally {
            setIsLoading(false);
        }
    }, [fetchCustomerProfile]);

    const register = useCallback(async (email: string, password: string, companyName: string, industry?: string) => {
        try {
            console.log('Starting registration for:', email);
            const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });

            if (authError) {
                console.error('Registration auth error:', authError.message);
                return { error: authError.message };
            }
            if (!authData.user) {
                console.error('Registration error: No user returned');
                return { error: 'Kullanıcı oluşturulamadı.' };
            }

            console.log('Auth user created, ID:', authData.user.id);
            console.log('Creating customer profile...');

            const { error: profileError } = await supabase
                .from('customer_profiles')
                .insert({
                    id: authData.user.id,
                    company_name: companyName,
                    industry: industry || null,
                    ai_prompt_prefix: 'Profesyonel bir dil kullan.'
                });

            if (profileError) {
                console.error('Profile creation error details:', profileError);
                return { error: 'Profil oluşturulurken hata oluştu: ' + profileError.message };
            }

            console.log('Registration and profile creation successful');
            return { error: null };
        } catch (err: unknown) {
            console.error('Unexpected registration error:', err);
            const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
            return { error: 'Beklenmeyen bir hata oluştu: ' + message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Sign out error:', err);
        } finally {
            setUser(null);
            setSession(null);
            setCustomerProfile(null);
            window.location.href = '/login';
        }
    }, []);

    const updateProfile = useCallback(async (updates: Partial<CustomerProfile>): Promise<boolean> => {
        if (!user) return false;
        try {
            const { error } = await supabase.from('customer_profiles').update(updates).eq('id', user.id);
            if (error) return false;
            const newProfile = await fetchCustomerProfile(user.id);
            setCustomerProfile(newProfile);
            return true;
        } catch {
            return false;
        }
    }, [user, fetchCustomerProfile]);

    // Determine role: prefer explicit role field, fall back to is_admin boolean
    const resolvedRole = customerProfile?.role
        ?? (customerProfile?.is_admin ? 'admin' : 'client');

    const value: AuthContextType = {
        user,
        session,
        customerProfile,
        isAdmin: resolvedRole === 'admin',
        isContentCreator: resolvedRole === 'content_creator',
        userRole: resolvedRole,
        isLoading,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
