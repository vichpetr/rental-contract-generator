import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Database features will not work.');
}

// Default: Managed by parent (false) unless explicitly set to 'true'
const enablePersistence = import.meta.env.VITE_SUPABASE_PERSIST_SESSION === 'true';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: enablePersistence,
        autoRefreshToken: enablePersistence,
        detectSessionInUrl: enablePersistence
    }
});

export const setSession = async (session) => {
    if (!session) {
        await supabase.auth.signOut();
        return;
    }
    // Set the session for the client
    // .setSession() expects { access_token, refresh_token }
    await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token
    });
};
