const Footer = () => 
{
    return (<>
        <footer className="w-full border-t border-orange-200/30 dark:border-orange-900/20 backdrop-blur-sm bg-white/70 dark:bg-slate-950/50 transition-colors duration-300 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-base font-bold text-slate-800 dark:text-white">
                    Electric Bill Monitoring
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track your energy consumption with real-time monitoring and intelligent insights for a sustainable future.
                </p>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200 dark:border-slate-700/50">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-500">
                  © {new Date().getFullYear()} Electric Bill Monitoring. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
    </>)

}
export default Footer