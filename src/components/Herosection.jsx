import { getBills } from "../services/BillServices";
import { useState, useEffect } from 'react';
const HeroSection = () => {
  const [LatestConsume, setLatestConsume] = useState(null);
  const [LatestPayment, setLatestPayment] = useState(null);

   useEffect(() => {
  const fetchLatest = async () => {
    try {
      const res  = await getBills({ page: 1, per_page: 1 });
      const data = res.data?.data ?? [];

      setLatestConsume(data[0] ?? null);
      setLatestPayment(data[0] ?? null);

      
      
    } catch (err) {
      console.error('Could not fetch latest bill:', err);
    }
  };
  fetchLatest();
}, []);

const Total = LatestConsume?.Total ?? 0;
const Payment = LatestPayment?.Payment ?? 0;

return (<>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-tight">
                  Electric Bill
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 mt-2">
                    Monitoring
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400/90 tracking-wide">
                  Track. Analyze. Save Energy.
                </p>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Take control of your energy consumption with real-time monitoring, intelligent insights, and actionable cost-saving recommendations. Save money while reducing your carbon footprint.
                </p>
              </div>
            </div>
          
            <div className="relative">
              <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 border border-orange-200/50 dark:border-orange-500/20 shadow-2xl shadow-orange-200/20 dark:shadow-orange-500/10 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-3xl animate-pulse"></div>
                <div className="relative space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Energy Usage</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                      {Total} kWh
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-lg">Previous Consume</div>
                  </div>
                  <div className="pt-4 border-t border-slate-300 dark:border-slate-700/50 flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Last Payment</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{new Intl.NumberFormat('en-PH', {style: 'currency', currency: 'PHP'}).format(Payment)}</span>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl"></div>
              </div>
              <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl rotate-12 opacity-20 blur-sm animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full opacity-20 blur-sm"></div>
            </div>
          </div>
        </div>

</>);
}
export default HeroSection;