import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine, LineChart, Line } from 'recharts';
import { Upload, TrendingUp, Activity, FileSpreadsheet, Play, ArrowLeft, BarChart3, User, LineChart as LineChartIcon, Zap, AlertTriangle, Info } from 'lucide-react';
import './index.css';

const App = () => {
  const [data, setData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('upload');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const tooltipDefinitions = {
    totalAccounts: "Total number of trading accounts being monitored in the system.",
    overLimit: "Number of accounts that have exceeded their notional trading limits (>100% utilization).",
    nearLimit: "Number of accounts that are at or above 70% of their notional trading limits.",
    hotAccounts: "Accounts with unusual trading activity (>2.5 standard deviations above their average volume).",
    totalNotional: "Sum of all trading volumes across all accounts for the most recent trading date.",
    accountsAtRisk: "Percentage of accounts that are either near their limit (≥70%) or have exceeded their limit."
  };

  const renderTooltipIcon = (tooltipKey) => (
    <div className="relative inline-block ml-1">
      <Info 
        className="w-3 h-3 text-blue-300/60 hover:text-blue-200 cursor-help transition-colors"
        onMouseEnter={() => setHoveredTooltip(tooltipKey)}
        onMouseLeave={() => setHoveredTooltip(null)}
      />
      {hoveredTooltip === tooltipKey && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-blue-900/95 text-white text-xs rounded-lg shadow-lg border border-blue-300/20 w-64 z-50">
          <div className="text-center">
            {tooltipDefinitions[tooltipKey]}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-900/95"></div>
        </div>
      )}
    </div>
  );

  const generateDemoData = () => {
    const accountData = [
      { accountNumber: 'GS001', name: 'Goldman Sachs', baseVolume: 35000000, limit: 120000000 },
      { accountNumber: 'JPM002', name: 'JPMorgan Chase', baseVolume: 45000000, limit: 65000000 },
      { accountNumber: 'MS003', name: 'Morgan Stanley', baseVolume: 30000000, limit: 110000000 },
      { accountNumber: 'BAC004', name: 'Bank of America', baseVolume: 28000000, limit: 95000000 },
      { accountNumber: 'C005', name: 'Citigroup', baseVolume: 38000000, limit: 48000000 },
      { accountNumber: 'WFC006', name: 'Wells Fargo', baseVolume: 25000000, limit: 85000000 },
      { accountNumber: 'DB007', name: 'Deutsche Bank', baseVolume: 22000000, limit: 90000000 },
      { accountNumber: 'BARC008', name: 'Barclays', baseVolume: 20000000, limit: 75000000 },
      { accountNumber: 'CS009', name: 'Credit Suisse', baseVolume: 32000000, limit: 42000000 },
      { accountNumber: 'UBS010', name: 'UBS', baseVolume: 18000000, limit: 80000000 },
      { accountNumber: 'BNP011', name: 'BNP Paribas', baseVolume: 24000000, limit: 100000000 },
      { accountNumber: 'SG012', name: 'Societe Generale', baseVolume: 21000000, limit: 88000000 },
      { accountNumber: 'HSBC013', name: 'HSBC', baseVolume: 40000000, limit: 55000000 },
      { accountNumber: 'SC014', name: 'Standard Chartered', baseVolume: 16000000, limit: 70000000 },
      { accountNumber: 'RBC015', name: 'Royal Bank of Canada', baseVolume: 26000000, limit: 95000000 },
      { accountNumber: 'TD016', name: 'TD Bank', baseVolume: 19000000, limit: 85000000 },
      { accountNumber: 'NOM017', name: 'Nomura', baseVolume: 15000000, limit: 65000000 },
      { accountNumber: 'MZ018', name: 'Mizuho', baseVolume: 17000000, limit: 72000000 },
      { accountNumber: 'SMBC019', name: 'Sumitomo Mitsui', baseVolume: 14000000, limit: 68000000 },
      { accountNumber: 'MUFG020', name: 'MUFG', baseVolume: 13000000, limit: 60000000 }
    ];

    const dateColumns = [];
    const startDate = new Date('2024-01-01');
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dateColumns.push(date.toISOString().split('T')[0]);
      }
    }

    const accounts = accountData.map(({ accountNumber, name: accountName, baseVolume, limit: notionalLimit }) => {
      const trades = {};
      let totalVolume = 0;
      let validTrades = [];
      let limitWarningCount = 0;

      dateColumns.forEach((date, index) => {
        let volume = 0;
        if (Math.random() > 0.1) {
          const safeMultiplier = 0.3 + Math.random() * 0.4;
          volume = baseVolume * safeMultiplier;
          
          if (accountNumber === 'JPM002' && index === 5) {
            volume = notionalLimit * 1.08;
          } else if (accountNumber === 'C005' && index < 4) {
            volume = notionalLimit * (0.8 + Math.random() * 0.25);
          } else if (accountNumber === 'CS009' && [2, 7, 12].includes(index)) {
            volume = notionalLimit * (0.75 + Math.random() * 0.2);
          } else if (accountNumber === 'HSBC013' && [1, 8, 15].includes(index)) {
            volume = notionalLimit * (0.72 + Math.random() * 0.15);
          }
          
          volume *= (0.9 + Math.random() * 0.2);

          if (volume >= notionalLimit * 0.7) {
            limitWarningCount++;
          }
        }
        
        trades[date] = Math.round(volume);
        totalVolume += volume;
        if (volume > 0) validTrades.push(volume);
      });

      const avgVolume = validTrades.length > 0 ? totalVolume / validTrades.length : 0;
      const variance = validTrades.length > 1 
        ? validTrades.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) / (validTrades.length - 1)
        : 0;
      const stdDev = Math.sqrt(variance);
      
      const maxVolume = Math.max(...validTrades, 0);
      const isHot = maxVolume > (avgVolume + 2.5 * stdDev) && stdDev > 0;
      
      const currentUtilization = maxVolume / notionalLimit;
      const isNearLimit = currentUtilization >= 0.7;
      const isOverLimit = currentUtilization > 1.0;

      return {
        accountNumber,
        accountName,
        trades,
        totalVolume,
        avgVolume,
        stdDev,
        maxVolume,
        isHot,
        hotScore: isHot ? maxVolume - (avgVolume + 2.5 * stdDev) : 0,
        notionalLimit,
        currentUtilization,
        isNearLimit,
        isOverLimit,
        limitWarningCount
      };
    });

    return { accounts, dateColumns };
  };

  const loadDemoData = () => {
    setLoading(true);
    setFileName('Eagle Eye Demo Data');
    setIsDemoMode(true);
    
    setTimeout(() => {
      const demoData = generateDemoData();
      setData(demoData);
      setLoading(false);
      setCurrentPage('stats');
    }, 1000);
  };

  const processExcelData = (workbook) => {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }

    const headers = jsonData[0];
    const dateColumns = headers.slice(4);

    const processedData = jsonData.slice(1).map(row => {
      const accountNumber = row[0];
      const accountName = row[1];
      const notionalLimit = parseFloat(row[3]) || 0;
      if (!accountNumber || !accountName || notionalLimit <= 0) return null;

      const trades = {};
      let totalVolume = 0;
      let validTrades = [];
      let limitWarningCount = 0;

      dateColumns.forEach((date, index) => {
        const volume = parseFloat(row[index + 4]) || 0;
        trades[date] = volume;
        totalVolume += volume;
        if (volume > 0) {
          validTrades.push(volume);
          if (volume >= notionalLimit * 0.7) {
            limitWarningCount++;
          }
        }
      });

      const avgVolume = validTrades.length > 0 ? totalVolume / validTrades.length : 0;
      const variance = validTrades.length > 1 
        ? validTrades.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) / (validTrades.length - 1)
        : 0;
      const stdDev = Math.sqrt(variance);
      
      const maxVolume = Math.max(...validTrades, 0);
      const isHot = maxVolume > (avgVolume + 2.5 * stdDev) && stdDev > 0;
      
      const currentUtilization = maxVolume / notionalLimit;
      const isNearLimit = currentUtilization >= 0.7;
      const isOverLimit = currentUtilization > 1.0;

      return {
        accountNumber,
        accountName,
        trades,
        totalVolume,
        avgVolume,
        stdDev,
        maxVolume,
        isHot,
        hotScore: isHot ? maxVolume - (avgVolume + 2.5 * stdDev) : 0,
        notionalLimit,
        currentUtilization,
        isNearLimit,
        isOverLimit,
        limitWarningCount
      };
    }).filter(Boolean);

    return { accounts: processedData, dateColumns };
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setFileName(file.name);
    setIsDemoMode(false);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const processedData = processExcelData(workbook);
      setData(processedData);
      setCurrentPage('stats');
    } catch (error) {
      alert(`Error processing file: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (!data) return null;

    // Get most recent date for top volume calculation
    const mostRecentDate = data.dateColumns[data.dateColumns.length - 1];

    const topVolume = [...data.accounts]
      .map(account => ({
        ...account,
        recentVolume: account.trades[mostRecentDate] || 0
      }))
      .sort((a, b) => b.recentVolume - a.recentVolume)
      .slice(0, 10);

    const hotAccounts = data.accounts
      .filter(account => account.isHot)
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, 10);

    const limitWarningAccounts = data.accounts
      .filter(account => account.isNearLimit)
      .sort((a, b) => b.currentUtilization - a.currentUtilization);

    const overlimitAccounts = data.accounts.filter(account => account.isOverLimit);

    // Calculate daily total notional volume across all accounts
    const dailyTotals = data.dateColumns.map(date => {
      const totalVolume = data.accounts.reduce((sum, account) => {
        return sum + (account.trades[date] || 0);
      }, 0);
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalVolume
      };
    });

    return {
      topVolume,
      hotAccounts,
      limitWarningAccounts,
      overlimitAccounts,
      dailyTotals,
      totalAccounts: data.accounts.length,
      totalHotAccounts: hotAccounts.length,
      totalLimitWarningAccounts: limitWarningAccounts.length,
      totalOverlimitAccounts: overlimitAccounts.length
    };
  }, [data]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatAccountDisplay = (account) => {
    return `${account.accountName} (${account.accountNumber})`;
  };

  const goBackToUpload = () => {
    setCurrentPage('upload');
    setData(null);
    setFileName('');
    setIsDemoMode(false);
    setActiveTab('overview');
    setSelectedAccount(null);
  };

  const viewAccountDetail = (account) => {
    setSelectedAccount(account);
    setCurrentPage('account-detail');
  };

  const goBackToStats = () => {
    setCurrentPage('stats');
    setSelectedAccount(null);
  };

  if (currentPage === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Eagle Eye</h1>
            <p className="text-blue-200 text-lg max-w-2xl mx-auto">
              Monitor trading limits and analyze account performance with advanced risk detection
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-blue-300/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Upload Your Data</h2>
              <p className="text-blue-200">Excel workbook with account numbers, names, limits, and trading volumes</p>
            </div>

            <div className="flex items-center justify-center mb-8">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-blue-300/40 rounded-xl cursor-pointer hover:border-blue-300/60 transition-all duration-200 hover:bg-white/5">
                <div className="flex flex-col items-center justify-center pt-8 pb-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-blue-300" />
                  </div>
                  <p className="text-lg text-blue-100 mb-2">
                    <span className="font-semibold">Click to upload</span> your Excel workbook
                  </p>
                  <p className="text-sm text-blue-300">Supports .xlsx and .xls files</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                />
              </label>
            </div>

            <div className="flex items-center justify-center">
              <div className="flex items-center gap-6">
                <div className="h-px bg-blue-300/30 w-16"></div>
                <span className="text-blue-200 text-sm font-medium">OR</span>
                <div className="h-px bg-blue-300/30 w-16"></div>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                onClick={loadDemoData}
                disabled={loading}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Play className="w-5 h-5" />
                Explore with Demo Data
              </button>
            </div>

            {loading && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                <p className="text-blue-200 mt-4">
                  {isDemoMode ? 'Generating demo data...' : 'Processing your data...'}
                </p>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/10">
            <h3 className="text-xl font-bold text-white mb-4">Expected Data Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-200">
              <div>
                <h4 className="font-semibold text-blue-100 mb-2">Column Structure</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Column A: Client account numbers</li>
                  <li>• Column B: Account names</li>
                  <li>• Column D: Notional limits</li>
                  <li>• Column E+: Trading dates and volumes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-100 mb-2">Analytics Provided</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Limit monitoring and alerts</li>
                  <li>• Hot account detection (>2.5σ)</li>
                  <li>• Risk utilization tracking</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'stats') {
    const tabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'limit-monitor', label: 'Limit Monitor', icon: AlertTriangle },
      { id: 'top-volume', label: 'Top Volume', icon: TrendingUp },
      { id: 'hot-accounts', label: 'Hot Accounts', icon: Zap },
      { id: 'all-accounts', label: 'All Accounts', icon: User }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goBackToUpload}
              className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-400/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Eagle Eye</h1>
              <div className="flex items-center justify-center text-blue-200">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                <span className="text-sm">{fileName}</span>
                {isDemoMode && <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded">DEMO</span>}
              </div>
            </div>
            
            <div className="w-24"></div>
          </div>

          <div className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-blue-300/20">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-blue-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {stats && (
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                          <Activity className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Total Accounts</p>
                            {renderTooltipIcon('totalAccounts')}
                          </div>
                          <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Number of accounts in data population
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-red-400/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center mr-4">
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Over Limit</p>
                            {renderTooltipIcon('overLimit')}
                          </div>
                          <p className="text-2xl font-bold text-white">{stats.totalOverlimitAccounts}</p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Accounts exceeding 100% utilization
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                          <AlertTriangle className="w-6 h-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Near Limit</p>
                            {renderTooltipIcon('nearLimit')}
                          </div>
                          <p className="text-2xl font-bold text-white">{stats.totalLimitWarningAccounts}</p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Accounts at 70%+ utilization
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mr-4">
                          <Zap className="w-6 h-6 text-red-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Hot Accounts</p>
                            {renderTooltipIcon('hotAccounts')}
                          </div>
                          <p className="text-2xl font-bold text-white">{stats.totalHotAccounts}</p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Accounts trading >2.5σ above their average
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-green-400 font-bold text-lg">$</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Total Notional Volume</p>
                            {renderTooltipIcon('totalNotional')}
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {formatCurrency(data.accounts.reduce((sum, account) => {
                              const mostRecentDate = data.dateColumns[data.dateColumns.length - 1];
                              return sum + (account.trades[mostRecentDate] || 0);
                            }, 0))}
                          </p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Sum of all account volumes for most recent date
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                          <span className="text-purple-400 font-bold text-lg">%</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className="text-blue-200 text-sm font-medium">Accounts at Risk</p>
                            {renderTooltipIcon('accountsAtRisk')}
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {(((stats.totalLimitWarningAccounts + stats.totalOverlimitAccounts) / stats.totalAccounts) * 100).toFixed(1)}%
                          </p>
                          <p className="text-blue-300/70 text-xs mt-1">
                            Accounts ≥70% of limit or over limit
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
                    <h2 className="text-2xl font-bold text-white mb-6">Top 10 Account Volumes</h2>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topVolume.map(account => ({
                          ...account,
                          displayName: `${account.accountName} (${account.accountNumber})`
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="displayName"
                            stroke="#dbeafe"
                            fontSize={12}
                            angle={-45}
                            textAnchor="end"
                            height={100}
                          />
                          <YAxis
                            stroke="#dbeafe"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 58, 138, 0.95)',
                              border: '1px solid rgba(147, 197, 253, 0.3)',
                              borderRadius: '12px',
                              color: '#fff'
                            }}
                            formatter={(value) => [formatCurrency(value), 'Recent Volume']}
                          />
                          <Bar dataKey="recentVolume" fill="url(#rbcGradient)" radius={[4, 4, 0, 0]} />
                          <defs>
                            <linearGradient id="rbcGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                              <stop offset="95%" stopColor="#1e40af" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <LineChartIcon className="w-6 h-6 mr-3 text-green-400" />
                      Total Plantwide Notional Volume
                    </h2>
                    <div className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.dailyTotals}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis
                            dataKey="date"
                            stroke="#dbeafe"
                            fontSize={12}
                          />
                          <YAxis
                            stroke="#dbeafe"
                            fontSize={12}
                            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(30, 58, 138, 0.95)',
                              border: '1px solid rgba(147, 197, 253, 0.3)',
                              borderRadius: '12px',
                              color: '#fff'
                            }}
                            formatter={(value) => [formatCurrency(value), 'Total Volume']}
                          />
                          <Line
                            type="monotone"
                            dataKey="totalVolume"
                            stroke="#10b981"
                            strokeWidth={3}
                            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-blue-200 text-sm">
                        Daily sum of notional volume across all accounts in the portfolio
                      </p>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'limit-monitor' && (
                <div className="space-y-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-orange-400/20">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3 text-orange-400" />
                      WARNING: Accounts Within 70% of Limit ({stats.totalLimitWarningAccounts})
                    </h2>
                    {stats.limitWarningAccounts.length > 0 ? (
                      <div className="space-y-4">
                        {stats.limitWarningAccounts.map((account, index) => (
                          <div
                            key={account.accountNumber}
                            className="flex items-center justify-between p-4 bg-white/5 rounded-xl border-l-4 border-orange-400 cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => viewAccountDetail(account)}
                          >
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-white font-semibold">{formatAccountDisplay(account)}</p>
                                <p className="text-blue-200 text-sm">
                                  Max: {formatCurrency(account.maxVolume)} • Limit: {formatCurrency(account.notionalLimit)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-orange-400 font-bold text-lg">{(account.currentUtilization * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-16 h-16 text-blue-300/30 mx-auto mb-4" />
                        <p className="text-blue-200 text-lg">All accounts within safe limits</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'top-volume' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-green-400" />
                    Top Accounts by Volume
                  </h2>
                  <div className="space-y-4">
                    {stats.topVolume.map((account, index) => (
                      <div
                        key={account.accountNumber}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-blue-300/10 cursor-pointer hover:bg-white/10 transition-all"
                        onClick={() => viewAccountDetail(account)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{formatAccountDisplay(account)}</p>
                            <p className="text-blue-200 text-sm">
                              Avg: {formatCurrency(account.avgVolume)} • Limit: {formatCurrency(account.notionalLimit)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">{formatCurrency(account.totalVolume)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'hot-accounts' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <Zap className="w-6 h-6 mr-3 text-red-400" />
                    Hot Accounts (>2.5σ above average)
                  </h2>
                  {stats.hotAccounts.length > 0 ? (
                    <div className="space-y-4">
                      {stats.hotAccounts.map((account, index) => (
                        <div
                          key={account.accountNumber}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl border-l-4 border-red-400 cursor-pointer hover:bg-white/10 transition-all"
                          onClick={() => viewAccountDetail(account)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                              <span className="text-white font-bold">{index + 1}</span>
                            </div>
                            <div>
                              <p className="text-white font-semibold">{formatAccountDisplay(account)}</p>
                              <p className="text-blue-200 text-sm">
                                Max: {formatCurrency(account.maxVolume)} • Avg: {formatCurrency(account.avgVolume)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-red-400 font-bold text-lg">+{formatCurrency(account.hotScore)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Zap className="w-16 h-16 text-blue-300/30 mx-auto mb-4" />
                      <p className="text-blue-200 text-lg">No hot accounts detected</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'all-accounts' && (
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <User className="w-6 h-6 mr-3 text-blue-400" />
                    All Accounts ({data.accounts.length})
                  </h2>
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {data.accounts
                      .sort((a, b) => b.totalVolume - a.totalVolume)
                      .map((account, index) => (
                      <div
                        key={account.accountNumber}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-blue-300/10 cursor-pointer hover:bg-white/10 transition-all"
                        onClick={() => viewAccountDetail(account)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-bold text-sm">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">{formatAccountDisplay(account)}</p>
                            <p className="text-blue-200 text-sm">
                              Total: {formatCurrency(account.totalVolume)} • Limit: {formatCurrency(account.notionalLimit)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'account-detail' && selectedAccount) {
    const chartData = data.dateColumns.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: selectedAccount.trades[date] || 0,
      limit: selectedAccount.notionalLimit
    }));

    const maxVolume = Math.max(...Object.values(selectedAccount.trades));
    const utilizationPercentage = (maxVolume / selectedAccount.notionalLimit * 100).toFixed(1);

    // Calculate days active (days with volume > 0)
    const daysActive = Object.values(selectedAccount.trades).filter(volume => volume > 0).length;

    // Calculate average notional volume (total volume / days active)
    const averageNotionalVolume = daysActive > 0 ? selectedAccount.totalVolume / daysActive : 0;

    // Calculate yesterday's volume (most recent date)
    const mostRecentDate = data.dateColumns[data.dateColumns.length - 1];
    const yesterdayVolume = selectedAccount.trades[mostRecentDate] || 0;
    const formattedYesterdayDate = new Date(mostRecentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={goBackToStats}
              className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-400/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Account Details</h1>
              <div className="flex items-center justify-center text-blue-200">
                <User className="w-4 h-4 mr-2" />
                <span className="text-sm">{formatAccountDisplay(selectedAccount)}</span>
              </div>
            </div>

            <div className="w-24"></div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            {/* 1. Account Status */}
            <div className={`bg-white/10 backdrop-blur-xl rounded-2xl p-6 border ${selectedAccount.isHot ? 'border-red-400/20' : 'border-blue-300/20'}`}>
              <div className="flex items-center">
                <div className={`w-12 h-12 ${selectedAccount.isHot ? 'bg-red-500/20' : 'bg-blue-500/20'} rounded-xl flex items-center justify-center mr-4`}>
                  <Zap className={`w-6 h-6 ${selectedAccount.isHot ? 'text-red-400' : 'text-blue-400'}`} />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Account Status</p>
                  <p className={`text-lg font-bold ${selectedAccount.isHot ? 'text-red-400' : 'text-green-400'}`}>
                    {selectedAccount.isHot ? 'HOT' : 'Normal'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Current Notional Limit */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Current Notional Limit</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedAccount.notionalLimit)}</p>
                </div>
              </div>
            </div>

            {/* 7. Yesterday's Volume */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Yesterday's Volume ({formattedYesterdayDate})</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(yesterdayVolume)}</p>
                </div>
              </div>
            </div>

            {/* 3. Average Notional Volume */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Average Notional Volume</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(averageNotionalVolume)}</p>
                </div>
              </div>
            </div>

            {/* 4. Max Utilization */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-orange-400 font-bold text-lg">%</span>
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Max Utilization</p>
                  <p className="text-xl font-bold text-white">{utilizationPercentage}%</p>
                </div>
              </div>
            </div>

            {/* 5. Days Active */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-4">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Days Active (Within Period)</p>
                  <p className="text-xl font-bold text-white">{daysActive}</p>
                </div>
              </div>
            </div>

            {/* 6. Total Volume */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-300/20">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-green-400 font-bold text-lg">$</span>
                </div>
                <div>
                  <p className="text-blue-200 text-sm font-medium">Total Volume (Within Data Period)</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(selectedAccount.totalVolume)}</p>
                </div>
              </div>
            </div>

            
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-blue-300/20">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <LineChartIcon className="w-6 h-6 mr-3 text-blue-400" />
              Trading Volume Over Time
            </h2>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="date"
                    stroke="#dbeafe"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#dbeafe"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 58, 138, 0.95)',
                      border: '1px solid rgba(147, 197, 253, 0.3)',
                      borderRadius: '12px',
                      color: '#fff'
                    }}
                    formatter={(value, name) => [
                      name === 'volume' ? formatCurrency(value) : formatCurrency(value),
                      name === 'volume' ? 'Volume' : 'Limit'
                    ]}
                  />
                  <ReferenceLine y={selectedAccount.notionalLimit} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "Notional Limit", position: "topLeft", fill: "#ef4444", fontSize: 12 }} />
                  <ReferenceLine y={averageNotionalVolume} stroke="#5e0094ff" strokeDasharray="3 3" label={{ value: "Average Volume", position: "topRight", fill: "#5e0094ff", fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#3b82f6"
                    fill="url(#colorVolume)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-blue-200 text-sm">
                Red dashed line: Notional limit ({formatCurrency(selectedAccount.notionalLimit)}) •
                Purple dotted line: Average volume ({formatCurrency(averageNotionalVolume)})
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
};

export default App;