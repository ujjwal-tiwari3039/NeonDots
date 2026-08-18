/**
 * Profile Management
 * 
 * Handles creating and fetching user profiles from the public.profiles table.
 */

import { supabase } from './client.js';

/**
 * Create a profile row for a newly signed-up user.
 * @param {string} userId - The authenticated user's UUID
 * @param {string} username - The chosen username
 * @returns {{ data: object|null, error: object|null }}
 */
export async function createProfile(userId, username) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                username: username,
                avatar_url: null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Profile creation error:', error.message);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected profile creation error:', err);
        return { data: null, error: { message: 'An unexpected error occurred while creating your profile.' } };
    }
}

/**
 * Fetch a user's profile by their UUID.
 * @param {string} userId - The authenticated user's UUID
 * @returns {{ data: object|null, error: object|null }}
 */
export async function getProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Profile fetch error:', error.message);
            return { data: null, error };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected profile fetch error:', err);
        return { data: null, error: { message: 'An unexpected error occurred while fetching your profile.' } };
    }
}
