import React, { useEffect, useState } from 'react';
import { PlusCircle, Home, Briefcase, Dumbbell, LogOut, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { API_URL } from '../../lib/api';

type UserData = {
  username: string;
  name: string;
  email: string;
  mobile: string;
};

type SavedLocation = {
  _id: string;
  name: string;
  info: string;
  icon: string;
};

type ParkingHistory = {
  _id: string;
  name: string;
  duration: string;
  date: string;
  status: string;
};

const iconMap: Record<string, React.ElementType> = {
  Home,
  Briefcase,
  Dumbbell,
};

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userData, setUserData] = useState<UserData>({
    username: '',
    name: '',
    email: '',
    mobile: '',
  });

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [parkingHistory, setParkingHistory] = useState<ParkingHistory[]>([]);
  const [newLocation, setNewLocation] = useState({ name: '', info: '', icon: 'Home' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!token && !isLoggedIn) {
          navigate('/login');
          return;
        }

        const [userRes, locRes, histRes] = await Promise.all([
          fetch(`${API_URL}/api/auth/me`, { headers }),
          fetch(`${API_URL}/api/auth/locations`, { headers }),
          fetch(`${API_URL}/api/auth/history`, { headers }),
        ]);

        const userData = await userRes.json();
        const locData = await locRes.json();
        const histData = await histRes.json();

        setUserData({
          username: userData.username || '',
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
        });

        if (locData.success) setSavedLocations(locData.data);
        if (histData.success) setParkingHistory(histData.data);

      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      setUserData({
        username: updated.username || '',
        name: updated.name || '',
        email: updated.email || '',
        mobile: updated.mobile || '',
      });
      alert('Profile saved!');
      setIsEditing(false);
    } catch (err) {
      alert('Failed to save. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== retypePassword) {
      alert('New passwords do not match!');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setRetypePassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddLocation = async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/locations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newLocation),
      });
      const data = await res.json();
      if (data.success) {
        setSavedLocations(data.data);
        setNewLocation({ name: '', info: '', icon: 'Home' });
        setShowAddLocationModal(false);
      }
    } catch (err) {
      alert('Failed to add location.');
    }
  };

  const handleDeleteLocation = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/locations/${id}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json();
      if (data.success) setSavedLocations(data.data);
    } catch (err) {
      alert('Failed to delete location.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="pt-28 flex items-center justify-center min-h-screen">
        <p className="text-on-surface-variant font-bold uppercase tracking-widest animate-pulse text-sm">
          Loading profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-28 flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <main className="pt-28 pb-24 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8">
      <div className="md:col-span-12 space-y-8">
        <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="font-headline text-xl md:text-5xl font-extrabold tracking-tight text-primary mb-3">
              Account Settings
            </h1>
            <p className="text-on-surface-variant font-body max-w-xl">
              Update your account settings while keeping track of your activity and usage history.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-sm font-headline font-bold text-[10px] uppercase tracking-widest border-none cursor-pointer"
          >
            <LogOut size={14} /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Personal Information */}
          <section className="bg-surface-container-low rounded-xl p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#660000]"></div>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[#330000]">Personal Information</h2>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="text-sm font-semibold text-gray-500 hover:underline">Cancel</button>
                    <button onClick={handleSave} className="text-sm font-bold text-primary-container hover:underline">Save</button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="text-sm font-bold text-primary-container hover:underline">Edit Details</button>
                )}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Username', key: 'username' as keyof UserData },
                { label: 'Full Name', key: 'name' as keyof UserData },
                { label: 'Email Address', key: 'email' as keyof UserData },
                { label: 'Mobile Number', key: 'mobile' as keyof UserData },
              ].map((field) => (
                <div key={field.label} className="flex flex-col gap-1">
                  <label className="font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">{field.label}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData[field.key]}
                      onChange={(e) => setUserData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="bg-surface p-4 rounded-sm border outline-none"
                    />
                  ) : (
                    <div className="bg-surface p-4 rounded-sm text-on-surface font-medium">{userData[field.key] || '—'}</div>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="font-headline text-[12px] uppercase tracking-widest text-on-surface-variant font-bold">Password</label>
                <button onClick={() => setShowPasswordModal(true)} className="text-m font-semibold text-primary-container hover:underline w-fit">Change Password</button>
              </div>
            </div>
          </section>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md space-y-4">
                <h3 className="text-lg font-bold text-[#330000]">Change Password</h3>
                <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full p-3 border rounded-md outline-none" />
                <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 border rounded-md outline-none" />
                <input type="password" placeholder="Re-type New Password" value={retypePassword} onChange={(e) => setRetypePassword(e.target.value)} className="w-full p-3 border rounded-md outline-none" />
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-sm">Cancel</button>
                  <button onClick={handleChangePassword} className="px-4 py-2 bg-[#660000] text-white rounded-md text-sm">Save</button>
                </div>
              </div>
            </div>
          )}

          {/* Saved Locations */}
          <section className="bg-surface-container-low rounded-xl p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[#330000]">Saved Locations</h2>
              <PlusCircle size={24} className="text-primary-container cursor-pointer" onClick={() => setShowAddLocationModal(true)} />
            </div>
            <div className="space-y-3">
              {savedLocations.length === 0 ? (
                <p className="text-on-surface-variant text-sm italic">No saved locations yet.</p>
              ) : savedLocations.map((loc) => {
                const Icon = iconMap[loc.icon] || Home;
                return (
                  <div key={loc._id} className="bg-surface-container-lowest p-4 rounded-lg flex items-center gap-4 transition-all hover:scale-[1.02]">
                    <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-on-surface">{loc.name}</h4>
                      <p className="text-xs text-on-surface-variant">{loc.info}</p>
                    </div>
                    <button onClick={() => handleDeleteLocation(loc._id)} className="text-error hover:opacity-70">
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Add Location Modal */}
          {showAddLocationModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-[#330000]">Add Location</h3>
                  <button onClick={() => setShowAddLocationModal(false)}><X size={20} /></button>
                </div>
                <input
                  type="text"
                  placeholder="Location Name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="w-full p-3 border rounded-md outline-none"
                />
                <input
                  type="text"
                  placeholder="Details (e.g. Level P1, Bay 14-B)"
                  value={newLocation.info}
                  onChange={(e) => setNewLocation({ ...newLocation, info: e.target.value })}
                  className="w-full p-3 border rounded-md outline-none"
                />
                <select
                  value={newLocation.icon}
                  onChange={(e) => setNewLocation({ ...newLocation, icon: e.target.value })}
                  className="w-full p-3 border rounded-md outline-none"
                >
                  <option value="Home">Home</option>
                  <option value="Briefcase">Work</option>
                  <option value="Dumbbell">Gym</option>
                </select>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowAddLocationModal(false)} className="px-4 py-2 text-sm">Cancel</button>
                  <button onClick={handleAddLocation} className="px-4 py-2 bg-[#660000] text-white rounded-md text-sm">Add</button>
                </div>
              </div>
            </div>
          )}

          {/* Parking History */}
          <section className="lg:col-span-2 bg-surface-container-low rounded-xl p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[#330000]">Parking History</h2>
              <Link to="/history" className="px-6 py-2 bg-[#660000] text-white text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-primary-container transition-all">
                View All History
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingHistory.length === 0 ? (
                <p className="text-on-surface-variant text-sm italic">No parking history yet.</p>
              ) : parkingHistory.slice(0, 3).map((item) => (
                <div key={item._id} className="bg-surface p-6 rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest py-1 px-2 bg-error/10 text-error rounded-full">
                      {item.status}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">{item.date}</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-lg">{item.name}</h4>
                    <p className="text-xs text-on-surface-variant">{item.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}