'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '../lib/store';
import AdminLogin from '../components/AdminLogin';
import DashboardContent from '../components/DashboardContent';

function DashboardInner() {
  const searchParams = useSearchParams();
  // ক্লিন আপ লজিক এখানেও যোগ করা হয়েছে
  const rawFund = searchParams.get('fund') || 'asahay-sahajjo';
  const fund = rawFund.replace('funds/', '').replace('/', '');

  const { fetchData, transactions, addTransaction, deleteTransaction, editTransaction } = useStore();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    if (isLogged) fetchData(fund);
  }, [isLogged, fund, fetchData]);

  if (!isLogged) return <AdminLogin onLoginSuccess={() => setIsLogged(true)} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-emerald-800 text-white text-center py-2 text-xs font-bold uppercase tracking-widest">
        ম্যানেজমেন্ট মোড: {fund.replace('-', ' ')}
      </div>
      <DashboardContent 
        currentFund={fund} 
        transactions={transactions} 
        onAdd={(data) => addTransaction(data, fund)}
        onDelete={(id) => deleteTransaction(id, fund)}
        onEdit={(id, data) => editTransaction(id, data, fund)}
        fetchData={() => fetchData(fund)}
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center p-20 font-bold">লোড হচ্ছে...</div>}>
      <DashboardInner />
    </Suspense>
  );
}