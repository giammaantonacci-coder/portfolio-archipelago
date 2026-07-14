'use client';

import * as React from 'react';
import { LogOut, MailCheck, CloudOff } from 'lucide-react';
import { useAuth } from './auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/** Sezione profilo: login via magic link e sincronizzazione cloud (Supabase). */
export function AuthSyncCard() {
  const { user, loading, isConfigured, signInWithMagicLink, signOut } = useAuth();
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    setErrorMsg(null);
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else {
      setStatus('sent');
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3">
        <h2 className="text-base font-bold">Sincronizzazione</h2>

        {!isConfigured && (
          <p className="flex items-start gap-2 text-sm text-text-secondary">
            <CloudOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              I tuoi dati restano su questo dispositivo. Configura Supabase (URL e anon key) per
              sincronizzare piani e preferiti tra dispositivi con un accesso via magic link.
            </span>
          </p>
        )}

        {isConfigured && !loading && user && (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              Connesso come <strong className="text-text-primary">{user.email}</strong>. Piani e
              preferiti si sincronizzano automaticamente.
            </p>
            <Button variant="outline" onClick={() => void signOut()}>
              <LogOut className="h-4 w-4" aria-hidden />
              Esci
            </Button>
          </div>
        )}

        {isConfigured && !loading && !user && (
          <form onSubmit={handleSend} className="space-y-2">
            <p className="text-sm text-text-secondary">
              Inserisci la tua email per ricevere un magic link e sincronizzare i dati.
            </p>
            <div className="flex gap-2">
              <label htmlFor="magic-email" className="sr-only">
                Email
              </label>
              <Input
                id="magic-email"
                type="email"
                required
                placeholder="tua@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="secondary" disabled={status === 'sending'}>
                {status === 'sending' ? 'Invio…' : 'Invia link'}
              </Button>
            </div>
            {status === 'sent' && (
              <p className="flex items-center gap-2 text-sm text-[#2b8f55]" role="status">
                <MailCheck className="h-4 w-4" aria-hidden />
                Controlla la tua email: ti abbiamo inviato un link di accesso.
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red" role="alert">
                {errorMsg ?? 'Invio non riuscito. Riprova.'}
              </p>
            )}
            <p className="text-xs text-text-secondary">
              L’autenticazione non è obbligatoria per cercare un parcheggio.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
