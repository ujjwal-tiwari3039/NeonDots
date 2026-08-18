/**
 * Authentication Module
 * 
 * Wraps Supabase auth methods with clean error handling.
 * All functions return { data, error } for consistent consumption.
 */

import { supabase } from './client.js';
import { createProfile } from './profile.js';

/**
 * Sign up a new user with email/password, then create their profile.
 * @param {string} email
 * @param {string} password
 * @param {string} username
 * @returns {{ data: object|null, error: object|null, emailConfirmation: boolean }}
 */
export async function signUp(email, password, username) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) {
            return { data: null, error: formatAuthError(error), emailConfirmation: false };
        }

        // Check if email confirmation is required
        // When email confirmation is ON, data.user exists but data.session is null
        const needsConfirmation = data.user && !data.session;

        // Create profile row (the user UUID exists even before email confirmation)
        if (data.user) {
            const profileResult = await createProfile(data.user.id, username);
            if (profileResult.error) {
                console.warn('Profile creation failed (user may need to verify email first):', profileResult.error.message);
                // Don't block signup — profile can be created on first login if RLS blocks this
            }
        }

        return {
            data,
            error: null,
            emailConfirmation: needsConfirmation
        };
    } catch (err) {
        console.error('Unexpected signup error:', err);
        return {
            data: null,
            error: { message: 'An unexpected error occurred. Please try again.' },
            emailConfirmation: false
        };
    }
}

/**
 * Sign in an existing user with email/password.
 * @param {string} email
 * @param {string} password
 * @returns {{ data: object|null, error: object|null }}
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return { data: null, error: formatAuthError(error) };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected signin error:', err);
        return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
}

/**
 * Sign out the current user.
 * @returns {{ error: object|null }}
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            return { error: formatAuthError(error) };
        }

        return { error: null };
    } catch (err) {
        console.error('Unexpected signout error:', err);
        return { error: { message: 'An unexpected error occurred during sign out.' } };
    }
}

/**
 * Send a password reset email.
 * @param {string} email
 * @returns {{ data: object|null, error: object|null }}
 */
export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email);

        if (error) {
            return { data: null, error: formatAuthError(error) };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected password reset error:', err);
        return { data: null, error: { message: 'An unexpected error occurred. Please try again.' } };
    }
}

/**
 * Get the current session (for checking persistent login on page load).
 * @returns {{ session: object|null, error: object|null }}
 */
export async function getSession() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            return { session: null, error: formatAuthError(error) };
        }

        return { session: data.session, error: null };
    } catch (err) {
        console.error('Unexpected session check error:', err);
        return { session: null, error: { message: 'Could not verify your session.' } };
    }
}

/**
 * Listen for auth state changes (login, logout, token refresh).
 * @param {Function} callback - Receives (event, session)
 * @returns {{ data: { subscription: object } }}
 */
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}

/**
 * Convert Supabase auth errors into user-friendly messages.
 */
function formatAuthError(error) {
    const message = error.message || '';

    // Map common Supabase error messages to friendlier versions
    if (message.includes('Invalid login credentials')) {
        return { message: 'Incorrect email or password. Please try again.' };
    }
    if (message.includes('User already registered')) {
        return { message: 'An account with this email already exists. Try logging in instead.' };
    }
    if (message.includes('Password should be at least')) {
        return { message: 'Password is too weak. Use at least 6 characters.' };
    }
    if (message.includes('Unable to validate email address')) {
        return { message: 'Please enter a valid email address.' };
    }
    if (message.includes('Email not confirmed')) {
        return { message: 'Please verify your email before logging in. Check your inbox.' };
    }
    if (message.includes('For security purposes')) {
        return { message: 'Too many attempts. Please wait a moment before trying again.' };
    }
    if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        return { message: 'Network error. Please check your connection and try again.' };
    }

    // Fallback: return original message
    return { message: message || 'An error occurred. Please try again.' };
}
