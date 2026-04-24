import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowRight, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { motion } from "motion/react";
import AdminLayout from "./AdminLayout";

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

const COLORS = ['#3e0502', '#735a39', '#e4e2dd', '#a0522d', '#c4a882'];

const lineData = [
  { time: '06:00', occupancy: 150, vacancy: 180 },
  { time: '10:00', occupancy: 120, vacancy: 150 },
  { time: '14:00', occupancy: 160, vacancy: 170 },
  { time: '18:00', occupancy: 80, vacancy: 140 },
  { time: '22:00', occupancy: 110, vacancy: 130 },
];

const barData = [
  { name: '08AM', value: 20 },
  { name: '10AM', value: 35 },
  { name: '12PM', value: 60 },
  { name: '02PM', value: 95 },
  { name: '04PM', value: 80 },
  { name: '06PM', value: 40 },
  { name: '08PM', value: 30 },
];

interface Stats {
  activeSessions: number;
  dailyIncidents: number;
  totalCarparks: number;
  availableCarparks: number;
  fullCarparks: number;
}

interface AreaSummary {
  _id: string;
  totalCarparks: number;
  totalAvailableLots: number;
  avgOccupancy: number;
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [areaSummary, setAreaSummary] = useState<AreaSummary[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('');

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch(`${ADMIN_API_URL}/api/carparks/stats`, { headers });
      const statsData = await statsRes.json();

      // Fetch area summary
      const summaryRes = await fetch(`${ADMIN_API_URL}/api/carparks/availability-summary`, { headers });
      const summaryData = await summaryRes.json();

      if (statsData.success) {
        setStats({
          activeSessions: statsData.data.activeSessions ?? statsData.data.totalCarparks ?? 0,
          dailyIncidents: statsData.data.dailyIncidents ?? 0,
          totalCarparks: statsData.data.totalCarparks ?? 0,
          availableCarparks: statsData.data.availableCarparks ?? 0,
          fullCarparks: statsData.data.fullCarparks ?? 0,
        });
      }

      if (summaryData.success) {
        setAreaSummary(summaryData.data.slice(0, 5));
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Build pie data from area summary
  const pieData = areaSummary.length > 0
    ? areaSummary.map((area, i) => ({
        name: area._id || 'Unknown',
        value: area.totalCarparks,
        color: COLORS[i % COLORS.length],
      }))
    : [
        { name: 'Wing A', value: 64, color: '#3e0502' },
        { name: 'Wing B', value: 24, color: '#735a39' },
        { name: 'Underground', value: 12, color: '#e4e2dd' },
      ];

  const totalPie = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <AdminLayout title="Dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 lg:p-8 space-y-6 lg:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="w-full min-w-0">
            <h3 className="text-2xl lg:text-4xl font-extrabold text-on-surface mb-1 break-words">
              Operational Overview
            </h3>
            {lastUpdated && (
              <p className="text-xs text-on-surface-variant">Last updated: {lastUpdated}</p>
            )}
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition px-3 py-2 border border-outline-variant/30 rounded-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">

          {/* Active Sessions */}
          <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden group editorial-shadow">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all group-hover:w-2" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-4">
              Total Carparks
            </p>
            {loading ? (
              <div className="h-12 w-24 bg-surface-container animate-pulse rounded" />
            ) : (
              <div className="flex items-baseline space-x-2">
                <h4 className="text-5xl font-extrabold text-primary leading-none">
                  {stats?.totalCarparks ?? 0}
                </h4>
                <span className="text-xs font-medium text-on-surface-variant">carparks</span>
              </div>
            )}
            <div className="mt-4 flex gap-4 text-xs">
              <span className="text-green-600 font-bold">✓ {stats?.availableCarparks ?? 0} available</span>
              <span className="text-red-600 font-bold">✗ {stats?.fullCarparks ?? 0} full</span>
            </div>
          </div>

          {/* Daily Incidents */}
          <Link
            to="/admin/complaints"
            className="bg-[#3e0502] p-8 rounded-lg relative overflow-hidden shadow-xl group hover:scale-[1.02] transition-transform"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-6">
              Daily Incidents
            </p>
            {loading ? (
              <div className="h-16 w-24 bg-white/10 animate-pulse rounded mb-8" />
            ) : (
              <div className="flex items-baseline space-x-4 mb-8">
                <h4 className="text-7xl font-extrabold text-white leading-none">
                  {String(stats?.dailyIncidents ?? 0).padStart(2, '0')}
                </h4>
                <span className="text-xl font-medium text-white/80">pending</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#e4e2dd]">Action Required</span>
              <ArrowRight className="text-white w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Usage Trends */}
          <div className="lg:col-span-2 bg-surface-container-low p-8 rounded-lg">
            <div className="flex justify-between items-center mb-10">
              <h5 className="text-lg font-bold">Usage Trends</h5>
              <div className="flex space-x-4">
                <span className="flex items-center text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2" />Occupancy
                </span>
                <span className="flex items-center text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-secondary mr-2" />Vacancy
                </span>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3e0502" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3e0502" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="occupancy" stroke="#3e0502" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" dataKey="vacancy" stroke="#735a39" strokeWidth={2} strokeDasharray="8 4" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area Occupancy — live from API */}
          <div className="bg-surface-container-low p-8 rounded-lg flex flex-col">
            <h5 className="text-lg font-bold mb-8">Area Distribution</h5>
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 mb-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">{stats?.totalCarparks ?? 0}</span>
                    <span className="text-[9px] uppercase tracking-widest opacity-60">Total</span>
                  </div>
                </div>
                <div className="w-full space-y-3">
                  {pieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-medium truncate max-w-[100px]">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold">
                        {totalPie > 0 ? Math.round((item.value / totalPie) * 100) : 0}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-surface-container-low p-8 rounded-lg">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h5 className="text-lg font-bold">Peak Inflow Hours</h5>
              <p className="text-xs text-on-surface-variant">Optimal staff allocation based on traffic.</p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'weekly' ? 'daily' : 'weekly')}
              className="text-[10px] font-bold uppercase tracking-widest text-primary border-b-2 border-primary hover:opacity-70 transition-opacity"
            >
              {viewMode === 'weekly' ? 'Weekly View' : 'Daily View'}
            </button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 80 ? '#3e0502' : '#d4af37'} />
                  ))}
                </Bar>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 'bold' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </motion.div>
    </AdminLayout>
  );
}

export default Dashboard;