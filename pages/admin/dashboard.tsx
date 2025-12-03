import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0A0A0A] border border-stone-800 p-6 rounded-xl">
                    <h3 className="text-stone-400 text-sm font-medium mb-2">Total Influencers</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#0A0A0A] border border-stone-800 p-6 rounded-xl">
                    <h3 className="text-stone-400 text-sm font-medium mb-2">Active Campaigns</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                </div>
                <div className="bg-[#0A0A0A] border border-stone-800 p-6 rounded-xl">
                    <h3 className="text-stone-400 text-sm font-medium mb-2">Pending Approvals</h3>
                    <p className="text-3xl font-bold text-white">0</p>
                </div>
            </div>
        </AdminLayout>
    );
}
