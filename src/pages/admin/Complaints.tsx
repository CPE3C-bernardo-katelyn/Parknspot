import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import AdminLayout from "./AdminLayout";
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFComplaintsReport } from '../../components/PDFComplaintsReport';
import { ADMIN_API_URL } from "../../lib/api";

type Complaint = {
  _id: string;
  title: string;
  description: string;
  submittedBy: string;
  location: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
};

function ComplaintsScreen() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [counts, setCounts] = useState({ PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('PENDING');
  const [viewingComplaint, setViewingComplaint] = useState<Complaint | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const token = localStorage.getItem('adminToken');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ADMIN_API_URL}/api/complaints?limit=100`, { headers });
      const data = await res.json();
      if (data.success) {
        setComplaints(data.data);
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to fetch complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const handleStatusUpdate = async (id: string, status: Complaint['status']) => {
    try {
      await fetch(`${ADMIN_API_URL}/api/complaints/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
      setViewingComplaint(null);
      fetchComplaints();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const filteredComplaints = complaints.filter(c => c.status === activeTab);
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <AdminLayout title="Complaints">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 lg:space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="col-span-1 lg:col-span-8 bg-surface-container-low p-6 lg:p-8 rounded-xl flex flex-col justify-center overflow-hidden w-full">
            <h3 className="text-2xl lg:text-3xl font-extrabold text-primary mb-2 break-words w-full">Resolution Overview</h3>
            <p className="text-sm lg:text-base text-on-surface-variant max-w-lg mb-6 break-words w-full">Manage user feedback and facility maintenance reports. Efficiently curate the Park 'N Spot experience by addressing issues with architectural precision.</p>
            <div className="flex flex-wrap gap-x-8 gap-y-4 lg:gap-12">
              <div className="shrink-0">
                <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Unresolved</p>
                <p className="text-3xl lg:text-4xl font-black text-primary">{counts.PENDING}</p>
              </div>
              <div className="shrink-0">
                <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">In Progress</p>
                <p className="text-3xl lg:text-4xl font-black text-secondary">{counts.IN_PROGRESS}</p>
              </div>
              <div className="shrink-0">
                <p className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Resolved</p>
                <p className="text-3xl lg:text-4xl font-black text-primary">{counts.RESOLVED}</p>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-4 bg-primary-container p-6 lg:p-8 rounded-xl relative overflow-hidden flex flex-col justify-end min-h-[180px] lg:min-h-[240px] w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container to-primary/80 opacity-60"></div>
            <img
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
              src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop"
              alt="Facility"
            />
            <div className="relative z-10 w-full">
              <p className="text-secondary-container font-bold text-lg leading-tight break-words w-full">Priority Escalation Active</p>
              <p className="text-white/70 text-sm mt-1 break-words w-full">{counts.PENDING} complaints require immediate attention.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-outline-variant/10 overflow-x-auto pb-1">
          <div className="flex items-center space-x-6 lg:space-x-10 min-w-max px-1">
            {(['PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={cn(
                  "font-bold pb-2 transition-colors relative text-sm lg:text-base",
                  activeTab === tab ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary border-b-2 border-transparent"
                )}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase().replace('_', ' ')}
                <span className="ml-2 text-[10px] bg-secondary-container px-2 py-0.5 rounded-full text-on-secondary-container">
                  {counts[tab].toString().padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>

          <PDFDownloadLink
            document={<PDFComplaintsReport complaints={complaints} stats={null} generatedAt={new Date().toLocaleString()} />}
            fileName={`park-n-spot-complaints-report-${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading: pdfLoading }) => (
              <button
                disabled={pdfLoading}
                className="mb-2 ml-4 bg-surface-container-highest text-on-surface px-3 py-1.5 rounded-sm text-[10px] lg:text-xs font-bold flex items-center gap-2 hover:bg-surface-container-high transition-all border border-outline-variant/30 shrink-0 disabled:opacity-50"
              >
                {pdfLoading ? (
                  <><div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />GENERATING...</>
                ) : (
                  <><FileText className="w-3 h-3" />EXPORT PDF</>
                )}
              </button>
            )}
          </PDFDownloadLink>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="p-20 text-center">
              <p className="text-on-surface-variant animate-pulse font-bold uppercase tracking-widest text-sm">Loading complaints...</p>
            </div>
          ) : paginatedComplaints.length > 0 ? paginatedComplaints.map((item) => (
            <div key={item._id} className="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 rounded-xl overflow-hidden shadow-sm flex items-stretch">
              <div className={cn(
                "w-1.5 self-stretch",
                item.status === 'PENDING' ? "bg-secondary" : item.status === 'IN_PROGRESS' ? "bg-primary" : "bg-outline-variant"
              )}></div>
              <div className="p-4 lg:p-6 flex-1 flex items-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 w-full items-center">
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter mb-1">ID: #{item._id.slice(-6)}</p>
                    <h4 className="text-base lg:text-lg font-bold text-on-surface leading-tight">{item.title}</h4>
                    <p className="text-xs lg:text-sm text-on-surface-variant line-clamp-1 mt-1">{item.description}</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Submitted By</p>
                    <p className="font-semibold text-xs lg:text-sm">{item.submittedBy}</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Location</p>
                    <p className="font-semibold text-xs lg:text-sm">{item.location}</p>
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold",
                      item.status === 'PENDING' ? "bg-secondary-container text-on-secondary-container" :
                      item.status === 'IN_PROGRESS' ? "bg-primary-container text-white" : "bg-surface-container-highest text-on-surface"
                    )}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex justify-end space-x-2">
                    <button onClick={() => handleStatusUpdate(item._id, 'RESOLVED')}
                      className="p-2 text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/20 rounded-sm" title="Resolve">
                      <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button onClick={() => handleStatusUpdate(item._id, 'PENDING')}
                      className="p-2 text-on-surface-variant hover:text-error transition-colors border border-outline-variant/20 rounded-sm" title="Reset">
                      <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                    <button onClick={() => setViewingComplaint(item)}
                      className="p-2 text-on-surface-variant hover:text-secondary transition-colors border border-outline-variant/20 rounded-sm" title="View Details">
                      <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant/20">
              <p className="text-on-surface-variant font-medium italic">No complaints found in this category.</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-1">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded bg-surface-container-highest text-on-surface disabled:opacity-50 border border-outline-variant/30">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={cn("w-10 h-10 flex items-center justify-center rounded text-sm font-bold transition-all border",
                      currentPage === i + 1 ? "bg-primary text-white border-primary" : "bg-surface-container-highest text-on-surface border-outline-variant/30")}>
                    {i + 1}
                  </button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded bg-surface-container-highest text-on-surface disabled:opacity-50 border border-outline-variant/30">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {viewingComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-lg shadow w-full max-w-lg">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter">{viewingComplaint.title}</h2>
                  <p className="text-sm text-on-surface-variant">Ticket ID: #{viewingComplaint._id.slice(-6)}</p>
                </div>
                <span className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter",
                  viewingComplaint.status === 'PENDING' ? "bg-error/10 text-error" :
                  viewingComplaint.status === 'IN_PROGRESS' ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"
                )}>
                  {viewingComplaint.status}
                </span>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Reporter</p>
                    <p className="font-bold">{viewingComplaint.submittedBy}</p>
                  </div>
                  <div className="p-4 bg-surface-container-low rounded-lg">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Location</p>
                    <p className="font-bold">{viewingComplaint.location}</p>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{viewingComplaint.description}</p>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-1">Submitted At</p>
                  <p className="text-sm">{new Date(viewingComplaint.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex justify-end mt-8 gap-4">
                <button onClick={() => handleStatusUpdate(viewingComplaint._id, 'IN_PROGRESS')}
                  className="px-6 py-2 rounded-sm font-bold text-sm bg-secondary text-white border border-secondary/50">
                  Mark In Progress
                </button>
                <button onClick={() => setViewingComplaint(null)}
                  className="bg-primary text-white px-8 py-2 rounded-sm font-bold text-sm border border-primary/50">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}

export default ComplaintsScreen;