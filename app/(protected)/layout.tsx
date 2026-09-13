'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Receipt, LogOut, Package } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Planos', href: '/planos', icon: Package },
  { name: 'Assinaturas', href: '/assinaturas', icon: CreditCard },
  { name: 'Pagamentos', href: '/pagamentos', icon: Receipt },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        localStorage.removeItem('subcontrol_auth');
        router.push('/login');
      } else {
        setTimeout(() => setIsChecking(false), 0);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('subcontrol_auth');
    localStorage.removeItem('subcontrol_user');
    toast.success('Sessão encerrada');
    router.push('/login');
  };

  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="flex w-64 flex-col fixed inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-blue-600">
             <CreditCard className="w-6 h-6" />
             <span className="text-xl font-bold text-gray-900 tracking-tight">SubControl</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
                  )}
                >
                  <item.icon
                    className={classNames(
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600',
                      'mr-3 flex-shrink-0 h-5 w-5'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="group flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 flex flex-1 flex-col">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
