import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Megaphone, Calculator, LogOut, FileText } from 'lucide-react';
import { AdminRoute } from './AdminRoute';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    const navItems = [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/influencers', icon: Users, label: 'Influencer Hub' },
        { href: '/admin/campaigns', icon: Megaphone, label: 'Campaigns' },
        { href: '/admin/calculator', icon: Calculator, label: 'Pricing Calculator' },
        { href: '/admin/legal-ai', icon: FileText, label: 'Legal AI' },
    ];

    return (
        <AdminRoute>
            <div className="min-h-screen bg-[#050505] flex">
                {/* Sidebar */}
                <aside className="w-64 bg-[#0A0A0A] border-r border-stone-800 flex flex-col">
                    <div className="p-6 border-b border-stone-800">
                        <h1 className="text-xl font-bold text-white">Fluency Admin</h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = router.pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-fluency-neon text-black font-bold'
                                        : 'text-stone-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-stone-800">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminRoute>
    );
};
