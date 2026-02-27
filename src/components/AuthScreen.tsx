import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Mode = 'login' | 'register';

export function AuthScreen() {
    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (!email.trim() || !password) {
            setError('Please enter an email and password.');
            return;
        }

        setLoading(true);

        if (mode === 'register') {
            const { error } = await supabase.auth.signUp({
                email: email.trim().toLowerCase(),
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                setMessage('Account created! You are now logged in.');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });
            if (error) {
                setError('Invalid email or password.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-ivory paper-grain flex items-center justify-center p-6">
            {/* Decorative background lines */}
            <div
                className="fixed inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(to bottom, var(--color-ink) 0px, var(--color-ink) 1px, transparent 1px, transparent 32px)',
                }}
            />

            <div className="w-full max-w-sm relative">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-block mb-4">
                        <div className="w-10 h-10 border-2 border-ink mx-auto flex items-center justify-center">
                            <div className="w-5 h-5 border border-ink" />
                        </div>
                    </div>
                    <h1
                        className="font-display text-4xl text-graphite tracking-tight mb-1"
                        style={{ fontFamily: 'var(--font-display)' }}
                    >
                        Classic Ledger
                    </h1>
                    <p className="text-sm text-muted" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                        Double-entry bookkeeping, simplified
                    </p>
                </div>

                {/* Form card */}
                <div
                    className="bg-white border p-8"
                    style={{ borderColor: 'var(--color-guide)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                    {/* Mode tabs */}
                    <div className="flex mb-7 border-b" style={{ borderColor: 'var(--color-guide)' }}>
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => { setMode(m); setError(null); setMessage(null); }}
                                className="flex-1 pb-3 text-sm font-medium tracking-wide uppercase transition-colors"
                                style={{
                                    fontFamily: 'var(--font-sans)',
                                    letterSpacing: '0.08em',
                                    color: mode === m ? 'var(--color-ink)' : 'var(--color-muted)',
                                    borderBottom: mode === m ? '2px solid var(--color-ink)' : '2px solid transparent',
                                    marginBottom: '-1px',
                                }}
                            >
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label
                                className="block text-xs uppercase tracking-widest mb-2"
                                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                placeholder="e.g. mario@gmail.com"
                                disabled={loading}
                                className="w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors"
                                style={{
                                    borderColor: 'var(--color-guide)',
                                    fontFamily: 'var(--font-serif)',
                                    color: 'var(--color-ink)',
                                }}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-ink)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-guide)')}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                className="block text-xs uppercase tracking-widest mb-2"
                                style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)', letterSpacing: '0.1em' }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full bg-transparent border-b py-2 text-sm focus:outline-none transition-colors"
                                style={{
                                    borderColor: 'var(--color-guide)',
                                    fontFamily: 'var(--font-mono)',
                                    color: 'var(--color-ink)',
                                }}
                                onFocus={(e) => (e.target.style.borderColor = 'var(--color-ink)')}
                                onBlur={(e) => (e.target.style.borderColor = 'var(--color-guide)')}
                            />
                        </div>

                        {/* Error / Message */}
                        {error && (
                            <p
                                className="text-xs py-2 px-3"
                                style={{ color: 'var(--color-accent)', background: 'var(--color-pale-red)', fontFamily: 'var(--font-sans)' }}
                            >
                                {error}
                            </p>
                        )}
                        {message && (
                            <p
                                className="text-xs py-2 px-3"
                                style={{ color: '#2d6a4f', background: '#d8f3dc', fontFamily: 'var(--font-sans)' }}
                            >
                                {message}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 text-sm uppercase tracking-widest font-medium transition-opacity mt-2"
                            style={{
                                background: 'var(--color-ink)',
                                color: 'var(--color-ivory)',
                                fontFamily: 'var(--font-sans)',
                                letterSpacing: '0.1em',
                                opacity: loading ? 0.6 : 1,
                            }}
                        >
                            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Footer note */}
                <p className="text-center text-xs mt-6" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                    Your workbooks are private and saved to your account.
                </p>
            </div>
        </div>
    );
}
