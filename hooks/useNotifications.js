import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export function useNotifications(token) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Poll for new notifications every 30 seconds (works on Vercel serverless)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  }, [token]);

  return { notifications, unreadCount, markAllRead, refetch: fetchNotifications };
}
