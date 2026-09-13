'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'register' && !name.trim()) {
      toast.error('Informe seu nome.');
      return;
    }

    if (!normalizedEmail || !password) {
      toast.error('Preencha e-mail e senha.');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (!data.session) {
        toast.success('Conta criada! Confira seu e-mail para confirmar o cadastro.');
        setMode('login');
        setLoading(false);
        return;
      }

      localStorage.setItem('subcontrol_user', JSON.stringify({ name: name.trim(), email: normalizedEmail }));
      localStorage.setItem('subcontrol_auth', 'true');
      toast.success('Conta criada com sucesso!');
      router.push('/dashboard');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    localStorage.setItem('subcontrol_user', JSON.stringify({
      name: data.user.user_metadata?.name || normalizedEmail,
      email: normalizedEmail,
    }));
    localStorage.setItem('subcontrol_auth', 'true');
    toast.success('Login efetuado com sucesso!');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SubControl
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'login' ? 'Faça login para gerenciar assinaturas' : 'Crie sua conta para começar'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="admin@exemplo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {mode === 'login' ? 'Ainda não tenho uma conta' : 'Já tenho uma conta'}
            </button>
          </div>

          <div className="mt-4 text-center">
             <p className="text-xs text-gray-500">Autenticação de demonstração armazenada neste navegador.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
