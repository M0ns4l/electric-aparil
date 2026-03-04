import { Zap, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getBills } from "../services/BillServices";

const Cards = () => {

  const [totalConsume, setTotalConsume] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);

   useEffect(() => {
  const fetchLatest = async () => {
    try {
      const res  = await getBills();
      const data = res.data?.data ?? [];

      const consume = data.reduce((sum, bill) => sum + parseFloat(bill.Total || 0), 0);
      const payment = data.reduce((sum, bill) => sum + parseFloat(bill.Payment || 0), 0);

      setTotalConsume(consume);
      setTotalPayment(payment);
    } catch (err) {
      console.error('Could not fetch latest bill:', err);
    }
  };
  fetchLatest();
}, []);
  return ( <>
       
        <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
              <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200/50 dark:border-orange-500/20 shadow-xl shadow-orange-200/20 dark:shadow-orange-500/10 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-300/30 dark:hover:shadow-orange-500/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Consume</h3>
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                   {totalConsume.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span className="text-xl">kWh</span>
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">Over All</p>
                  </div>
                </div>
              </div>
           
              <div className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-orange-200/50 dark:border-orange-500/20 shadow-xl shadow-orange-200/20 dark:shadow-orange-500/10 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-300/30 dark:hover:shadow-orange-500/20 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-2xl"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Payment</h3>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalPayment.toLocaleString('en-PH', {style: 'currency', currency: 'PHP'})}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 pt-1">Over All</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
  </>);
}

export default Cards;