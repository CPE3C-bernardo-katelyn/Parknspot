import { useEffect, useState } from "react";
import { TrendingUp, FileText, Calendar, ChevronDown, XCircle, RefreshCw } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { motion } from "motion/react";
import AdminLayout from "./AdminLayout";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFReport } from "../../components/PDFReport";

const ADMIN_API_URL = import.meta.env.VITE_ADMIN_API_URL;

const chartData = [
  { name: 'Mon', value: 80, turnover: 90 },
  { name: 'Tue', value: 20, turnover: 40 },
  { name: 'Wed', value: 50, turnover: 70 },
  { name: 'Thu', value: 30, turnover: 50 },
  { name: 'Fri', value: 10, turnover: 30 },
  { name: 'Sat', value: 40, turnover: 60 },
  { name: 'Sun', value: 20, turnover: 40 },
];

interface AreaSummary {
  _id: string;
  totalCarparks: number;
  totalAvailableLots: number;
  availableCount: number;
  fullCount: number;
  limitedCount: number;
  avgOccupancy: number;
}

interface StatsData {
  totalCarparks: number;
  availableCarparks: number;
  fullCarparks: number;
  limitedCarparks: number;
  dailyIncidents: number;
  utilization: number;
}

interface Complaint {
  _id: string;
  title: string;
  description: string;
  location: string;
  status: string;
  submittedBy: string;
  createdAt: string;
}

function ReportsScreen() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [areaSummary, setAreaSummary] = useState<AreaSummary[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isViewingAllZones, setIsViewingAllZones] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsRes, summaryRes, complaintsRes] = await Promise.all([
        fetch(`${ADMIN_API_URL}/api/carparks/stats`, { headers }),
        fetch(`${ADMIN_API_URL}/api/carparks/availability-summary`, { headers }),
        fetch(`${ADMIN_API_URL}/api/complaints?limit=5`, { headers }),
      ]);

      const [statsData, summaryData, complaintsData] = await Promise.all([
        statsRes.json(),
        summaryRes.json(),
        complaintsRes.json(),
      ]);

      if (statsData.success) {
        const total = statsData.data.totalCarparks || 1;
        const available = statsData.data.availableCarparks || 0;
        setStats({
          totalCarparks: statsData.data.totalCarparks ?? 0,
          availableCarparks: statsData.data.availableCarparks ?? 0,
          fullCarparks: statsData.data.fullCarparks ?? 0,
          limitedCarparks: statsData.data.limitedCarparks ?? 0,
          dailyIncidents: statsData.data.dailyIncidents ?? 0,
          utilization: Math.round((available / total) * 100),
        });
      }

      if (summaryData.success) setAreaSummary(summaryData.data);
      if (complaintsData.success) setComplaints(complaintsData.data);

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch reports data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Build occupancy zones from real API data
  const occupancyZones = areaSummary.map((area, i) => {
    const total = area.totalCarparks || 1;
    const full = area.fullCount || 0;
    const occupancy = Math.round((full / total) * 100);
    const colors = ['#3e0502', '#735a39', '#87726f', '#a0522d', '#c4a882'];
    return {
      id: area._id?.slice(0, 2).toUpperCase() || `Z${i}`,
      name: area._id || `Zone ${i + 1}`,
      location: `${area.totalCarparks} carparks · ${area.totalAvailableLots} available`,
      value: occupancy,
      color: colors[i % colors.length],
    };
  });

  // Build activity log from real complaints
  const activityLog = complaints.map(c => ({
    jp: c.submittedBy?.slice(0, 2).toUpperCase() || 'UN',
    name: c.submittedBy || 'Unknown',
    location: c.location || 'N/A',
    status: c.status,
    title: c.title,
  }));

  // PDF data
  const pdfOccupancyData = occupancyZones.slice(0, 3).map(z => ({
    id: z.id, name: z.name, location: z.location, value: z.value, color: z.color,
  }));
  const pdfActivityLog = activityLog.slice(0, 4).map(a => ({
    jp: a.jp, name: a.name, location: a.location,
  }));
  const pdfStats = stats ? {
    utilization: stats.utilization,
    availableSlots: stats.availableCarparks,
    activeSessions: stats.totalCarparks,
    dailyIncidents: stats.dailyIncidents,
  } : null;

  return (
    <AdminLayout title="Reports">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 lg:space-y-8 max-w-7xl mx-auto"
      >
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/80 backdrop-blur-md p-4 rounded-lg editorial-shadow mb-4 lg:mb-8 relative z-30 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 w-full sm:w-auto min-w-0">
            <h2 className="text-lg lg:text-xl font-bold tracking-tight text-on-surface break-words shrink-0">
              Reports & Analytics
            </h2>
            {lastUpdated && (
              <span className="text-[10px] text-on-surface-variant font-medium">
                Updated {lastUpdated}
              </span>
            )}
            <div className="relative w-full sm:w-auto min-w-0">
              <div
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="flex items-center bg-surface-container-low px-4 py-2 rounded-sm border border-outline-variant/30 cursor-pointer hover:bg-surface-container-high transition-colors w-full sm:w-auto justify-between gap-2"
              >
                <div className="flex items-center min-w-0">
                  <Calendar className="text-on-surface-variant w-4 h-4 mr-2 shrink-0" />
                  <span className="text-xs lg:text-sm font-medium text-on-surface truncate">
                    {new Date(dateRange.start).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} -{' '}
                    {new Date(dateRange.end).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </span>
                </div>
                <ChevronDown className="text-on-surface-variant w-4 h-4 shrink-0" />
              </div>

              {isCalendarOpen && (
                <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 z-50 bg-white p-4 lg:p-6 rounded-lg editorial-shadow border border-outline-variant/10 w-[calc(100vw-2rem)] sm:w-80">
                  <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-on-surface-variant">Select Range</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full bg-surface-container-low border-none p-2 rounded text-xs"
                          value={dateRange.start}
                          onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">End Date</label>
                        <input
                          type="date"
                          className="w-full bg-surface-container-low border-none p-2 rounded text-xs"
                          value={dateRange.end}
                          onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex flex-col gap-2">
                      <button
                        onClick={() => {
                          setDateRange({
                            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            end: new Date().toISOString().split('T')[0],
                          });
                          setIsCalendarOpen(false);
                        }}
                        className="text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low rounded transition-colors"
                      >
                        Last 30 Days
                      </button>
                      <button
                        onClick={() => {
                          setDateRange({
                            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            end: new Date().toISOString().split('T')[0],
                          });
                          setIsCalendarOpen(false);
                        }}
                        className="text-left px-3 py-2 text-xs font-medium hover:bg-surface-container-low rounded transition-colors"
                      >
                        Last 7 Days
                      </button>
                    </div>
                    <button
                      onClick={() => setIsCalendarOpen(false)}
                      className="w-full bg-primary text-white py-2 rounded-sm font-bold text-xs mt-4"
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition px-3 py-2 border border-outline-variant/30 rounded-sm"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>

            <PDFDownloadLink
              document={
                <PDFReport
                  stats={pdfStats}
                  dateRange={dateRange}
                  occupancyData={pdfOccupancyData}
                  activityLog={pdfActivityLog}
                />
              }
              fileName={`park-n-spot-report-${dateRange.start}-to-${dateRange.end}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <button
                  disabled={pdfLoading}
                  className="bg-surface-container-highest text-on-surface px-4 py-2 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all border border-outline-variant/30 disabled:opacity-50"
                >
                  {pdfLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Export PDF
                    </>
                  )}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Carparks', value: stats?.totalCarparks ?? 0, unit: 'carparks' },
            { label: 'Available', value: stats?.availableCarparks ?? 0, unit: 'carparks' },
            { label: 'Full', value: stats?.fullCarparks ?? 0, unit: 'carparks' },
            { label: 'Pending Incidents', value: stats?.dailyIncidents ?? 0, unit: 'complaints' },
          ].map(({ label, value, unit }) => (
            <div key={label} className="bg-surface-container-lowest rounded-xl p-5 border-l-4 border-primary">
              <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</p>
              {loading ? (
                <div className="h-8 w-16 bg-surface-container animate-pulse rounded" />
              ) : (
                <div className="flex items-baseline gap-1">
                  <h3 className="text-3xl font-extrabold text-on-surface">{value}</h3>
                  <span className="text-xs text-on-surface-variant">{unit}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chart + Peak Hour */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 bg-surface-container-lowest rounded-xl p-8 border-l-4 border-primary editorial-shadow">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-on-surface-variant text-sm font-medium uppercase tracking-widest mb-1">
                  Available Carparks Rate
                </p>
                <h3 className="text-4xl font-extrabold tracking-tighter text-on-surface">
                  {loading ? '—' : `${stats?.utilization ?? 0}%`}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-primary font-bold text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Live data</span>
              </div>
            </div>
            <div className="h-64 w-full bg-surface-container-low/50 rounded-lg overflow-hidden relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area type="monotone" dataKey="value" stroke="#3e0502" strokeWidth={4} fill="transparent" />
                  <Area type="monotone" dataKey="turnover" stroke="#735a39" strokeWidth={2} strokeDasharray="8 4" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-tighter">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>
          <div className="bg-secondary-container rounded-xl p-8 flex flex-col justify-center relative overflow-hidden editorial-shadow">
            <div className="relative z-10">
              <p className="text-on-secondary-container text-xs font-bold uppercase tracking-widest mb-2">Peak Hour</p>
              <h4 className="text-3xl font-black text-on-secondary-container tracking-tight">08:45 AM</h4>
              <p className="mt-4 text-on-secondary-container/80 text-sm leading-relaxed">
                System capacity usually reaches its zenith during the morning commute window.
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Calendar className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Occupancy by Zone + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Occupancy by Zone — live */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold tracking-tight">Occupancy by Zone</h3>
              {occupancyZones.length > 3 && (
                <span
                  onClick={() => setIsViewingAllZones(true)}
                  className="text-xs font-bold text-on-surface-variant cursor-pointer hover:text-primary underline underline-offset-4"
                >
                  View All
                </span>
              )}
            </div>
            <div className="bg-surface-container-low rounded-xl overflow-hidden p-1 space-y-1">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface-container-lowest rounded-lg animate-pulse" />
                ))
              ) : occupancyZones.length === 0 ? (
                <div className="p-8 text-center text-sm text-on-surface-variant">No zone data available</div>
              ) : (
                occupancyZones.slice(0, 3).map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-surface-container-highest text-on-surface rounded-sm font-bold text-xs">
                        {zone.id}
                      </div>
                      <div>
                        <p className="font-bold text-sm truncate max-w-[120px]">{zone.name}</p>
                        <p className="text-xs text-on-surface-variant">{zone.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-lg">{zone.value}%</p>
                      <div className="w-24 h-1 bg-surface-container-highest rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${zone.value}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Activity Log — live from complaints */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold tracking-tight">Recent Complaints</h3>
              <span className="text-xs text-on-surface-variant">{complaints.length} total</span>
            </div>
            <div className="bg-surface-container-lowest shadow-sm rounded-xl overflow-hidden">
              <div className="overflow-x-auto pb-2">
                {loading ? (
                  <div className="p-8 text-center animate-pulse text-sm text-on-surface-variant">Loading...</div>
                ) : activityLog.length === 0 ? (
                  <div className="p-8 text-center text-sm text-on-surface-variant">No complaints found.</div>
                ) : (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-surface-container-low text-on-surface-variant text-[10px] uppercase tracking-widest">
                        <th className="px-4 lg:px-6 py-4 font-bold">Submitted By</th>
                        <th className="px-4 lg:px-6 py-4 font-bold">Location</th>
                        <th className="px-4 lg:px-6 py-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                      {activityLog.map((log, i) => (
                        <tr key={i} className="hover:bg-surface-container-low transition-colors">
                          <td className="px-4 lg:px-6 py-4 flex items-center gap-3 whitespace-nowrap">
                            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-xs shrink-0">
                              {log.jp}
                            </div>
                            <span className="truncate">{log.name}</span>
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-on-surface-variant font-mono text-xs whitespace-nowrap">
                            {log.location}
                          </td>
                          <td className="px-4 lg:px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              log.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              log.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* View All Zones Modal */}
        {isViewingAllZones && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-lg editorial-shadow w-full max-w-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black tracking-tighter">All Facility Zones</h2>
                <button onClick={() => setIsViewingAllZones(false)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                {occupancyZones.map((zone, i) => (
                  <div key={i} className="p-4 bg-surface-container-low rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{zone.name}</p>
                      <p className="text-xs text-on-surface-variant">{zone.location}</p>
                    </div>
                    <span className="font-black text-primary">{zone.value}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-8">
                <button onClick={() => setIsViewingAllZones(false)} className="bg-primary text-white px-8 py-2 rounded-sm font-bold">
                  Close Registry
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}

export default ReportsScreen;