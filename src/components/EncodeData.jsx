import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Calculator, AlertCircle, Save, TrendingDown } from 'lucide-react';
import { getBills, createBill } from "../services/BillServices";

const EncodeData = ({ onBillSaved }) => {
  const [rates, setRates]               = useState('');
  const [consumeKwh, setConsumeKwh]     = useState('');  
  const [actualConsume, setActualConsume] = useState(0); 
  const [payment, setPayment]           = useState('');
  const [errors, setErrors]             = useState({});
  const [isCalculated, setIsCalculated] = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [isSaved, setIsSaved]           = useState(false);

  const [latestBill, setLatestBill]       = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(true);

 
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res  = await getBills({ page: 1, per_page: 1 });
        const data = res.data?.data ?? [];
        setLatestBill(data[0] ?? null);
      } catch (err) {
        console.error('Could not fetch latest bill:', err);
        setLatestBill(null);
      } finally {
        setLoadingLatest(false);
      }
    };
    fetchLatest();
  }, []);

 
  const handleRatesChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setRates(value);
      setErrors(prev => ({ ...prev, rates: '' }));
      setIsCalculated(false);
      setIsSaved(false);
    }
  };

  const handleConsumeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setConsumeKwh(value);
      setErrors(prev => ({ ...prev, consumeKwh: '' }));
      setIsCalculated(false);
      setIsSaved(false);
    }
  };
  
  const validateInputs = () => {
    const newErrors = {};
    if (!rates || rates.trim() === '') {
      newErrors.rates = 'Rates is required';
    } else if (parseFloat(rates) <= 0) {
      newErrors.rates = 'Rates must be greater than 0';
    }
    if (!consumeKwh || consumeKwh.trim() === '') {
      newErrors.consumeKwh = 'Current meter reading is required';
    } else if (parseFloat(consumeKwh) <= 0) {
      newErrors.consumeKwh = 'Meter reading must be greater than 0';
    } else if (latestBill && parseFloat(consumeKwh) <= parseFloat(latestBill.Consume)) {
      newErrors.consumeKwh = `Must be greater than previous reading (${latestBill.Consume} kWh)`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  
  const handleCompute = (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error('Please fill in all fields correctly', {
        icon: <AlertCircle className="w-5 h-5" />,
        duration: 3000,
      });
      return;
    }

    const ratesNum        = parseFloat(rates);
    const currentConsume  = parseFloat(consumeKwh);
    const previousConsume = latestBill ? parseFloat(latestBill.Consume) : 0;

    
    const consumed    = currentConsume - previousConsume;
    const calcPayment = consumed * ratesNum;

    setActualConsume(consumed);
    setPayment(calcPayment.toFixed(2));
    setIsCalculated(true);
    setIsSaved(false);

    toast.success('Calculation completed!', { icon: '⚡', duration: 3000 });
  };

  
  const handleSave = async () => {
    if (!isCalculated) {
      toast.error('Please compute the bill first.', { duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      await createBill({
        Rates:    parseFloat(rates),
        Consume:  parseFloat(consumeKwh),   
        Payment:  parseFloat(payment),
        Total:    parseFloat(actualConsume),
        BillDate: new Date().toISOString().split('T')[0],
        Status:   parseInt(0),
      });

      setIsSaved(true);
      toast.success('Bill saved successfully!', { icon: '💾', duration: 3000 });
      onBillSaved();
     
      const res  = await getBills({ page: 1, per_page: 1 });
      const data = res.data?.data ?? [];
      setLatestBill(data[0] ?? null);

    } catch (err) {
      console.error('Save failed:', err);
      const message = err?.response?.data?.message ?? 'Failed to save bill. Please try again.';
      toast.error(message, { duration: 4000 });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleReset = () => {
    setRates('');
    setConsumeKwh('');
    setPayment('');
    setActualConsume(0);
    setErrors({});
    setIsCalculated(false);
    setIsSaved(false);
    toast('Form reset', { icon: '🔄', duration: 2000 });
  };

  const formatCurrency = (value) => {
    if (!value) return '0.00';
    return parseFloat(value).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
         
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
              Bill Calculator
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Enter your current meter reading and rate to calculate this period's bill.
            </p>
          </div>
          
          <div className="mb-6">
            {loadingLatest ? (
              <div className="h-14 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
            ) : latestBill ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl">
                <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-sm text-blue-700 dark:text-blue-300 flex flex-wrap gap-x-6 gap-y-1">
                  <span>
                    Previous reading date:{' '}
                    <span className="font-semibold">
                      {new Date(latestBill.BillDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                  </span>
                  <span>
                    Previous meter reading:{' '}
                    <span className="font-semibold text-blue-800 dark:text-blue-200">
                      {latestBill.Consume} kWh
                    </span>
                  </span>
                  <span>
                    Previous rate:{' '}
                    <span className="font-semibold">₱{formatCurrency(latestBill.Rates)}/kWh</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-5 h-5 shrink-0" />
                No previous meter reading found. Full consumption will be used for this bill.
              </div>
            )}
          </div>
          
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 border border-orange-200/50 dark:border-orange-500/20 shadow-2xl shadow-orange-200/20 dark:shadow-orange-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-3xl pointer-events-none"></div>

            <div className="relative flex items-center gap-3 mb-6 sm:mb-8">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Quick Calculate</h3>
            </div>

            <form onSubmit={handleCompute} className="relative space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               
                <div className="space-y-2">
                  <label htmlFor="rates" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Rate per kWh (₱)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium">₱</span>
                    <input
                      type="text" id="rates" value={rates} onChange={handleRatesChange} placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-3 sm:py-3.5 text-base sm:text-lg bg-slate-50 dark:bg-slate-800/50 border-2 ${
                        errors.rates
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-700/50 focus:border-orange-500 focus:ring-orange-500/20'
                      } rounded-xl focus:ring-2 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200`}
                    />
                  </div>
                  {errors.rates ? (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{errors.rates}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Enter the current rate per kilowatt-hour</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="consumeKwh" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Current Meter Reading (kWh)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">kWh</span>
                    <input
                      type="text" id="consumeKwh" value={consumeKwh} onChange={handleConsumeChange} placeholder="0.00"
                      className={`w-full pl-14 pr-4 py-3 sm:py-3.5 text-base sm:text-lg bg-slate-50 dark:bg-slate-800/50 border-2 ${
                        errors.consumeKwh
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-slate-200 dark:border-slate-700/50 focus:border-orange-500 focus:ring-orange-500/20'
                      } rounded-xl focus:ring-2 focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all duration-200`}
                    />
                  </div>
                  {errors.consumeKwh ? (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{errors.consumeKwh}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">
                      {latestBill
                        ? `Previous reading was ${latestBill.Consume} kWh`
                        : 'Enter the current meter reading'}
                    </p>
                  )}
                </div>
              </div>
              
              {isCalculated && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Calculation Breakdown</p>
                  <div className="flex justify-between">
                    <span>Current reading</span>
                    <span className="font-medium text-slate-900 dark:text-white">{consumeKwh} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous reading</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {latestBill ? latestBill.Consume : 0} kWh
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span>Actual consumption</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">{actualConsume} kWh</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rate</span>
                    <span className="font-medium">₱{rates}/kWh</span>
                  </div>
                </div>
              )}
             
              <div className="space-y-2 pt-2">
                <label htmlFor="payment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Payment
                  {isCalculated && (
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({actualConsume} kWh × ₱{rates})
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 dark:text-orange-400 font-bold text-base sm:text-lg">₱</span>
                  <input
                    type="text" id="payment"
                    value={payment ? formatCurrency(payment) : '0.00'}
                    readOnly
                    className={`w-full pl-10 pr-4 py-4 sm:py-5 text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/20 border-2 border-orange-300 dark:border-orange-500/30 rounded-xl text-orange-700 dark:text-orange-400 cursor-not-allowed transition-all duration-200 ${
                      isCalculated ? 'ring-2 ring-orange-500/20' : ''
                    }`}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Actual Consumption × Rate per kWh
                </p>
              </div>
             
              <div className="flex flex-col sm:flex-row gap-4 pt-4">

                <button type="submit"
                  className="group relative flex-1 px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold text-base sm:text-lg 
                  rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Calculator className="w-5 h-5" /> Compute Bill
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                <button type="button" onClick={handleSave}
                  disabled={!isCalculated || isSaving || isSaved}
                  className={`flex-1 px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-base sm:text-lg rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    isSaved
                      ? 'bg-green-500 text-white cursor-not-allowed opacity-80'
                      : !isCalculated || isSaving
                      ? 'bg-slate-200 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-500 text-white hover:shadow-2xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-95  cursor-pointer'
                  }`}
                >
                  {isSaving ? (
                    <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg> Saving…</>
                  ) : isSaved ? (
                    <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg> Saved!</>
                  ) : (
                    <><Save className="w-5 h-5" /> Save Bill</>
                  )}
                </button>

                <button type="button" onClick={handleReset}
                  className="px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-200 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold 
                  text-base sm:text-lg rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-95 border border-slate-300 dark:border-slate-700/50  cursor-pointer"
                >
                  Reset
                </button>
              </div>

              {isCalculated && !isSaved && (
                <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Bill computed! Review the breakdown then click <strong>Save Bill</strong> to store the record.</span>
                  </div>
                </div>
              )}

              {isSaved && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Bill saved successfully and added to your billing history!</span>
                  </div>
                </div>
              )}
            </form>

            <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-slate-800/50 border border-orange-200 dark:border-slate-700/50 rounded-full">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-orange-700 dark:text-slate-400">
                Tip: Enter your <strong>current meter reading</strong>. Previous reading is deducted automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EncodeData;