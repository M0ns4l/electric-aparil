import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { getBills } from "../services/BillServices";





const SkeletonCards = ({ count }) => (
  <ul className="md:hidden space-y-3 mb-4" aria-hidden="true">
    {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
      <li key={i} className="rounded-2xl border border-slate-200 dark:border-slate-700/50
                              bg-white dark:bg-slate-900/50 p-4 animate-pulse space-y-3">
        <div className="flex justify-between pb-3 border-b border-slate-100 dark:border-slate-700/40">
          <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700/60" />
          <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700/60" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="space-y-1.5">
              <div className="h-2 w-12 rounded bg-slate-200 dark:bg-slate-700/60" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-700/60" />
            </div>
          ))}
        </div>
      </li>
    ))}
  </ul>
);



const TableBill = () => {

  const BillCard = ({ row, rowNumber }) => (
  <li className="rounded-2xl border border-slate-200 dark:border-slate-700/50
                 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
    {/* Card header */}
    <div className="flex items-center justify-between mb-3 pb-3
                    border-b border-slate-100 dark:border-slate-700/40">
      <span className="text-[11px] font-bold uppercase tracking-widest
                       text-slate-400 dark:text-slate-500">
        #{rowNumber}
      </span>
      <time className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {row.date}
      </time>
    </div>

    {/* 2-column data grid */}
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-wider
                       text-slate-400 dark:text-slate-500 mb-0.5">Rates</dt>
        <dd className="text-sm font-semibold text-orange-600 dark:text-orange-400 tabular-nums">
          ₱{row.rates.toFixed(2)}
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-wider
                       text-slate-400 dark:text-slate-500 mb-0.5">Reading</dt>
        <dd className="text-sm text-slate-700 dark:text-slate-300 tabular-nums">
          {row.reading} kWh
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-wider
                       text-slate-400 dark:text-slate-500 mb-0.5">Consume</dt>
        <dd className="text-sm text-slate-700 dark:text-slate-300 tabular-nums">
          {row.consume} kWh
        </dd>
      </div>
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-wider
                       text-slate-400 dark:text-slate-500 mb-0.5">Payment</dt>
        <dd className="text-sm font-semibold text-slate-900 dark:text-white tabular-nums">
          ₱{parseFloat(row.payment || 0).toLocaleString('en-PH', {
              minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </dd>
      </div>
    </dl>
  </li>
);

  const [tableData, setTableData]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [error, setError]               = useState(null);

 
  const [searchQuery, setSearchQuery]   = useState('');
  const [rowsPerPage, setRowsPerPage]   = useState(10);
  const [currentPage, setCurrentPage]   = useState(1);
  
  const [totalItems, setTotalItems]     = useState(0);
  const [totalPages, setTotalPages]     = useState(1);

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endIndex   = Math.min(currentPage * rowsPerPage, totalItems);

 
  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page:     currentPage,
        per_page: rowsPerPage,
        ...(searchQuery             && { search: searchQuery })
      };

      const response = await getBills(params);
      const json     = response.data; 
      
      const mapped = (json.data ?? []).map((item) => ({
        no:      item.ID,
        date:    new Date(item.BillDate).toLocaleDateString('en-US', {
                   year: 'numeric', month: 'short', day: 'numeric',
                 }),
        rates:   parseFloat(item.Rates),
        reading: parseFloat(item.Consume),
        consume: parseFloat(item.Total),
        payment: parseFloat(item.Payment)
      }));

      setTableData(mapped);
      setTotalItems(json.total     ?? 0);
      setTotalPages(json.last_page ?? 1);
    } catch (err) {
      console.error('Failed to fetch bills:', err);
      setError('Failed to load billing data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, rowsPerPage, searchQuery]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, rowsPerPage]);
  
  const goToPage     = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  const goToPrevious = ()     => currentPage > 1           && setCurrentPage(p => p - 1);
  const goToNext     = ()     => currentPage < totalPages  && setCurrentPage(p => p + 1);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      [1,2,3,4,'...',totalPages].forEach(p => pages.push(p));
    } else if (currentPage >= totalPages - 2) {
      [1,'...',totalPages-3,totalPages-2,totalPages-1,totalPages].forEach(p => pages.push(p));
    } else {
      [1,'...',currentPage-1,currentPage,currentPage+1,'...',totalPages].forEach(p => pages.push(p));
    }
    return pages;
  };
 

  const formatCurrency = (value) =>
    parseFloat(value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
 
  return (
    <div className="w-full py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4">
            Billing History
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            View and manage your complete electricity billing records
          </p>
        </div>

        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border border-orange-200/50 dark:border-orange-500/20 shadow-2xl shadow-orange-200/20 dark:shadow-orange-500/10 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent rounded-3xl pointer-events-none"></div>
        
          <div className="relative space-y-4 mb-6">

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by date, rates, consume, payment, status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl focus:outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
             
             
              <div className="flex-1 sm:max-w-[180px] relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700/50 focus:border-orange-500 rounded-xl focus:outline-none text-slate-900 dark:text-white appearance-none cursor-pointer transition-all duration-200"
                >
                  {[10, 20, 30, 50, 100].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                  ))}
                </select>
                <ChevronLeft className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-[-90deg] pointer-events-none" />
              </div>
             
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span>
                Showing{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalItems > 0 ? startIndex : 0}</span>
                {' '}–{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{endIndex}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalItems}</span> results
              </span>
              <span className="hidden sm:inline">
                Page <span className="font-semibold text-slate-900 dark:text-white">{totalItems > 0 ? currentPage : 0}</span>
                {' '}of <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
              </span>
            </div>
          </div>
      
          {error && (
            <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
              <button onClick={fetchBills} className="ml-auto underline hover:no-underline font-semibold">
                Retry
              </button>
            </div>
          )}

       
          {isLoading ? (
            <SkeletonCards count={rowsPerPage} />
          ) : tableData.length > 0 ? (
            <ul className="md:hidden space-y-3 mb-4">
              {tableData.map((row, index) => (
                <BillCard
                  key={row.no}
                  row={row}
                  rowNumber={(currentPage - 1) * rowsPerPage + index + 1}
                />
              ))}
            </ul>
          ) : (
            <div className="md:hidden flex flex-col items-center gap-2 py-12 text-center mb-4">
              <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 font-medium">No results found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search query</p>
            </div>
          )}
          <div className="relative hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/50">
            <table className="w-full text-left">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-700/50">
                <tr>
                  <th className="px-4 py-3 font-bold">No.</th>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">Rates</th>
                  <th className="px-4 py-3 font-bold">Reading</th>
                  <th className="px-4 py-3 font-bold">Consume</th>
                  <th className="px-4 py-3 font-bold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(rowsPerPage)].map((_, i) => (
                    <tr key={i} className="border-b border-slate-200 dark:border-slate-700/50 animate-pulse">
                      {[8,24,16,20,24,16].map((w, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className={`h-4 bg-slate-200 dark:bg-slate-700/50 rounded w-${w}`}></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr
                      key={row.no}
                      className={`border-b border-slate-200 dark:border-slate-700/50 transition-colors duration-150 hover:bg-orange-50 dark:hover:bg-orange-500/5 ${
                        index % 2 === 0 ? 'bg-white dark:bg-slate-900/50' : 'bg-slate-50 dark:bg-slate-800/30'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{row.date}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-orange-600 dark:text-orange-400">₱{row.rates.toFixed(2)}</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{row.reading} kWh</td>
                      <td className="px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">{row.consume} kWh</td>
                      <td className="px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">₱{formatCurrency(row.payment)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 font-medium">No results found</p>
                        <p className="text-xs text-slate-400">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
      
          {!isLoading && tableData.length > 0 && (
            <div className="relative mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="sm:hidden text-xs text-slate-600 dark:text-slate-400">
                Page <span className="font-semibold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-900 dark:text-white">{totalPages}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) =>
                    page === '...' ? (
                      <span key={`e-${index}`} className="px-2 text-slate-400 dark:text-slate-600">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-orange-100 hover:text-orange-600 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-orange-500 hover:text-white hover:shadow-lg hover:scale-105 active:scale-95'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="hidden sm:block w-24"></div>
            </div>
          )}

          <div className="absolute -top-6 -right-6 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default TableBill;