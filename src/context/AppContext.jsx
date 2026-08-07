import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, API_BASE_URL } from '@/services/api';

const AppContext = createContext(null);

function normalizeDept(raw) {
  if (!raw) return 'Road';
  const lower = raw.toLowerCase();
  if (lower.includes('road')) return 'Road';
  if (lower.includes('water')) return 'Water';
  if (lower.includes('telecom') || lower.includes('fiber')) return 'Telecom';
  if (lower.includes('gas')) return 'Gas';
  if (lower.includes('electr')) return 'Electricity';
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function normalizeStatus(raw) {
  if (!raw) return 'Submitted';
  const lower = raw.toLowerCase();
  if (lower === 'pending' || lower === 'submitted') return 'Under Review';
  if (lower === 'accepted') return 'Accepted';
  if (lower === 'in_progress') return 'In Progress';
  if (lower === 'resolved') return 'Resolved';
  if (lower === 'denied') return 'Denied';
  return raw;
}

function normalizePhoto(url) {
  if (!url) return 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop';
  if (url.startsWith('http://localhost:4000') || url.startsWith('http://127.0.0.1:4000')) {
    return url.replace(/http:\/\/(localhost|127\.0\.0\.1):4000/, API_BASE_URL);
  }
  if (url.startsWith('/uploads')) {
    return `${API_BASE_URL}${url}`;
  }
  return url;
}

const departments = ['Road', 'Water', 'Telecom', 'Gas', 'Electricity'];

const departmentStaff = {
  Road: ['Alex Rivera', 'Lina Khan', 'Carlos Gomez'],
  Water: ['Tia Brooks', 'Omar Nunez', 'Sarah Jenkins'],
  Telecom: ['Mia Chen', 'David Kim', 'Rachel Vance'],
  Gas: ['Sam Patel', 'Vikram Singh', 'Elena Rostova'],
  Electricity: ['Jules Adams', 'Nina Shah', 'Marcus Brody'],
};

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('roadguard-theme') || 'dark';
  });

  const [user, setUser] = useState({
    id: 4,
    name: 'Global Super Admin',
    email: 'superadmin@roadguard.ai',
    role: 'super_admin',
    department: 'All',
  });

  const [userAccounts, setUserAccounts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [notices, setNotices] = useState([]);
  const [isLoadingLive, setIsLoadingLive] = useState(true);

  // Synchronize ALL data live from Render PostgreSQL Database
  const fetchAllLiveData = async () => {
    setIsLoadingLive(true);

    // 1. Fetch All Live Complaints
    try {
      const liveComplaints = await api.getComplaints();
      if (Array.isArray(liveComplaints)) {
        const mapped = liveComplaints.map((item) => ({
          id: item.id,
          title: item.description?.substring(0, 60) || `Infrastructure Hazard #${item.id}`,
          department: normalizeDept(item.department || item.ai_suggested_dept),
          status: normalizeStatus(item.status),
          location: typeof item.location === 'object' && item.location ? `GPS (${item.location.lat ?? 12.97}, ${item.location.lng ?? 77.59})` : (item.location || 'Civic Corridor'),
          description: item.description || 'Citizen reported municipal infrastructure issue.',
          author: item.citizen_name || 'Citizen Report',
          assignedStaff: item.assigned_to || item.assigned_staff || null,
          likes: item.likes ?? 12,
          comments: item.comments || [],
          image: normalizePhoto(item.photo_url),
          confidence: Math.round((item.ai_confidence || 0.85) * 100),
          createdAt: item.submitted_at || item.created_at,
        }));
        setComplaints(mapped);
        console.log(`[RoadGuard] Live database loaded: ${mapped.length} complaints.`);
      }
    } catch (err) {
      console.warn('[RoadGuard] Complaints load notice:', err.message);
    }

    // 2. Fetch All Live Work Orders
    try {
      const liveOrders = await api.getWorkOrders();
      if (Array.isArray(liveOrders)) {
        const mappedOrders = liveOrders.map((o) => ({
          id: o.id,
          title: o.title,
          department: normalizeDept(o.department),
          schedule: o.start_date && o.end_date ? `${o.start_date} to ${o.end_date}` : 'Scheduled',
          engineers: o.engineers || 'Assigned Field Crew',
          route: typeof o.route === 'string' ? 'Active GeoJSON Corridor' : 'City Loop',
          status: o.status || 'working',
        }));
        setWorkOrders(mappedOrders);
      }
    } catch (err) {
      console.warn('[RoadGuard] Work orders load notice:', err.message);
    }

    // 3. Fetch All Live Conflicts
    try {
      const liveConflicts = await api.getConflicts();
      if (Array.isArray(liveConflicts)) {
        setConflicts(liveConflicts);
      }
    } catch (err) {
      console.warn('[RoadGuard] Conflicts load notice:', err.message);
    }

    // 4. Fetch Live Notices
    try {
      const liveNotices = await api.getNotices();
      if (Array.isArray(liveNotices)) {
        setNotices(liveNotices);
      }
    } catch (err) {
      console.warn('[RoadGuard] Notices load notice:', err.message);
    }

    // 5. Fetch Live Users
    try {
      const liveUsers = await api.getUsers();
      if (Array.isArray(liveUsers)) {
        setUserAccounts(liveUsers);
      }
    } catch (err) {
      console.warn('[RoadGuard] Users load notice:', err.message);
    }

    setIsLoadingLive(false);
  };

  useEffect(() => {
    fetchAllLiveData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('roadguard-theme', theme);
    }
  }, [theme]);

  // Auth Login with live backend
  const login = async (role, department, name, email) => {
    setUser({ id: Date.now(), role, department, name, email });
    try {
      const authResult = await api.login(email, 'SuperAdmin@2026');
      if (authResult?.user) {
        setUser((prev) => ({ ...prev, ...authResult.user }));
        fetchAllLiveData();
      }
    } catch {
      // Offline / role switch fallback
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  // Super Admin creates Super Dept accounts; Super Dept creates Dept Admin accounts
  const createAccount = async ({ name, email, password, role, department }) => {
    if (!user) return null;

    if (user.role === 'super_admin' && role !== 'super_dept') {
      alert('Super Admin can only create Super Dept Accounts.');
      return null;
    }

    if (user.role === 'super_dept') {
      if (role !== 'dept_admin') {
        alert('Super Dept Accounts can only create Dept Admin accounts.');
        return null;
      }
      if (department !== user.department) {
        alert(`Super Dept Accounts can only create accounts for their own department (${user.department}).`);
        return null;
      }
    }

    if (user.role === 'dept_admin') {
      alert('Dept Admins do not have permission to create accounts.');
      return null;
    }

    const payload = {
      name,
      email,
      password: password || 'demo123',
      role,
      department: user.role === 'super_admin' ? department : user.department,
    };

    try {
      const created = await api.createAccount(payload);
      setUserAccounts((prev) => [created, ...prev]);
      return created;
    } catch {
      const fallbackAcc = { id: Date.now(), ...payload, createdBy: user.name };
      setUserAccounts((prev) => [fallbackAcc, ...prev]);
      return fallbackAcc;
    }
  };

  // Submit citizen complaint (Direct DB insertion)
  const submitComplaint = async (payload) => {
    const tempId = Date.now();
    const newComplaint = {
      id: tempId,
      title: payload.title,
      department: normalizeDept(payload.department),
      status: 'Submitted',
      location: payload.location || 'Captured GPS',
      description: payload.description,
      author: user?.name || 'Citizen',
      assignedStaff: null,
      likes: 0,
      comments: [],
      image: payload.image,
      confidence: 90,
    };

    setComplaints((current) => [newComplaint, ...current]);

    try {
      const res = await api.submitComplaint({
        citizen_name: user?.name || 'Citizen Report',
        citizen_contact: '+1-555-0199',
        department: payload.department.toLowerCase(),
        photo_url: payload.image,
        description: payload.description,
        location: { lat: 12.9720, lng: 77.5910 },
      });
      if (res?.id) {
        setComplaints((current) =>
          current.map((c) => (c.id === tempId ? { ...c, id: res.id, image: normalizePhoto(res.photo_url || c.image) } : c))
        );
      }
    } catch (e) {
      console.warn('[RoadGuard] Complaint DB notice:', e.message);
    }
  };

  // Update complaint status (Accept, Deny, In Progress, Resolved)
  const updateComplaintStatus = (id, status) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin has read-only view of complaints.');
      return;
    }
    setComplaints((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  // Assign staff member to complaint
  const assignStaffToComplaint = (id, staffName) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin has read-only view of complaints.');
      return;
    }
    setComplaints((current) =>
      current.map((item) => (item.id === id ? { ...item, assignedStaff: staffName } : item))
    );
  };

  // Update work order status (yet_to_start | working | completed)
  const updateWorkOrderStatus = async (id, newStatus) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin has read-only view of work orders.');
      return;
    }
    setWorkOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );

    try {
      await api.updateWorkOrderStatus(id, newStatus);
    } catch (e) {
      console.warn('[RoadGuard] Work order status update notice:', e.message);
    }
  };

  // Create work order
  const createWorkOrder = async (payload) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin cannot create department work orders directly.');
      return null;
    }
    const dept = user?.role === 'super_dept' || user?.role === 'dept_admin' ? user.department : payload.department;
    const nextOrder = {
      id: Date.now(),
      title: payload.title,
      department: normalizeDept(dept),
      schedule: payload.schedule || '2026-08-20 to 2026-09-01',
      engineers: payload.engineers || 'Field Team Alpha',
      route: payload.route || 'Main Trenching Corridor',
      status: 'yet_to_start',
    };
    setWorkOrders((current) => [nextOrder, ...current]);

    try {
      const res = await api.createWorkOrder({
        department: dept,
        title: payload.title,
        start_date: '2026-08-20',
        end_date: '2026-09-01',
        buffer_m: 15,
        route: {
          type: 'LineString',
          coordinates: [
            [77.5910, 12.9720],
            [77.5945, 12.9735],
            [77.5980, 12.9750],
          ],
        },
      });
      if (res?.id) {
        fetchAllLiveData();
      }
    } catch (e) {
      console.warn('[RoadGuard] Work order DB notice:', e.message);
    }
    return nextOrder;
  };

  // Publish Notice — Strictly reserved for Super Dept Accounts
  const publishNotice = async (payload) => {
    if (user?.role !== 'super_dept') {
      alert('Permission Denied: Only Super Dept Accounts can publish work-contract notices.');
      return;
    }

    const newNotice = {
      id: Date.now(),
      title: payload.title,
      department: user.department,
      published_by_role: 'super_dept',
      published_by: user.name,
      detail: payload.detail,
      createdAt: new Date().toLocaleString(),
    };
    setNotices((current) => [newNotice, ...current]);

    try {
      await api.publishNotice({
        title: payload.title,
        content: payload.detail,
        work_order_id: null,
      });
    } catch (e) {
      console.warn('[RoadGuard] Notice publish notice:', e.message);
    }
  };

  const addComment = (id, text) => {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id
          ? { ...complaint, comments: [...complaint.comments, { author: user?.name || 'You', text }] }
          : complaint
      )
    );
  };

  const toggleLike = (id) => {
    setComplaints((current) =>
      current.map((complaint) => (complaint.id === id ? { ...complaint, likes: complaint.likes + 1 } : complaint))
    );
  };

  // Scope Filtering Helpers
  const getVisibleComplaints = () => {
    if (!user) return [];
    if (user.role === 'super_admin') return complaints;
    return complaints.filter((item) => item.department.toLowerCase() === user.department.toLowerCase());
  };

  const getVisibleWorkOrders = () => {
    if (!user) return [];
    if (user.role === 'super_admin') return workOrders;
    return workOrders.filter((item) => item.department.toLowerCase() === user.department.toLowerCase());
  };

  const getVisibleNotices = () => {
    if (!user) return [];
    if (user.role === 'super_admin') return notices;
    return notices.filter((item) => item.department.toLowerCase() === user.department.toLowerCase());
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      user,
      userAccounts,
      departments,
      departmentStaff,
      login,
      logout,
      createAccount,
      complaints,
      workOrders,
      conflicts,
      notices,
      submitComplaint,
      addComment,
      toggleLike,
      updateComplaintStatus,
      assignStaffToComplaint,
      updateWorkOrderStatus,
      createWorkOrder,
      publishNotice,
      getVisibleComplaints,
      getVisibleWorkOrders,
      getVisibleNotices,
      fetchAllLiveData,
      isLoadingLive,
    }),
    [theme, user, userAccounts, complaints, workOrders, conflicts, notices, isLoadingLive]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
