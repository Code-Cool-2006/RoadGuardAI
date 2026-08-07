import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

const initialComplaints = [
  {
    id: 1,
    title: 'Pothole cluster near Harbor Avenue',
    department: 'Road',
    status: 'Submitted', // Submitted, Accepted, Denied, In Progress, Resolved
    location: 'Harbor Ave & 8th St',
    description: 'Multiple potholes have formed after heavy rain and are causing traffic hazards.',
    author: 'Mina Patel',
    assignedStaff: null,
    likes: 24,
    comments: [{ author: 'Nadia', text: 'Thanks for reporting it.' }],
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    confidence: 92,
  },
  {
    id: 2,
    title: 'Water main leak beside school gate',
    department: 'Water',
    status: 'Accepted',
    location: 'Oak Street',
    description: 'A water leak is flooding the curb and creating slip risk near the school entrance.',
    author: 'Darius Cole',
    assignedStaff: 'Tia Brooks (Water Dept)',
    likes: 16,
    comments: [{ author: 'Ops Desk', text: 'Field crew dispatched.' }],
    image: 'https://images.unsplash.com/photo-1581578017430-4d36e98c4b7b?auto=format&fit=crop&w=900&q=80',
    confidence: 88,
  },
  {
    id: 3,
    title: 'Downed power cable on Elm Ridge',
    department: 'Electricity',
    status: 'In Progress',
    location: 'Elm Ridge',
    description: 'A cable has fallen near a residential driveway and needs immediate inspection.',
    author: 'Jules Adams',
    assignedStaff: 'Jules Adams (Grid Control)',
    likes: 31,
    comments: [{ author: 'Grid Control', text: 'Priority response assigned.' }],
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
    confidence: 96,
  },
];

const initialWorkOrders = [
  {
    id: 1,
    title: 'Harbor Avenue resurfacing',
    department: 'Road',
    schedule: '2026-08-12 to 2026-08-25',
    engineers: 'Alex Rivera, Lina Khan',
    route: 'Harbor Ave corridor',
    status: 'working', // yet_to_start, working, completed
  },
  {
    id: 2,
    title: 'School gate water repair',
    department: 'Water',
    schedule: '2026-08-13 to 2026-08-28',
    engineers: 'Tia Brooks',
    route: 'Oak Street corridor',
    status: 'yet_to_start',
  },
  {
    id: 3,
    title: 'Fiber optic cable ducting',
    department: 'Telecom',
    schedule: '2026-09-01 to 2026-09-12',
    engineers: 'Mia Chen',
    route: 'Downtown Loop',
    status: 'yet_to_start',
  },
];

const initialNotices = [
  {
    id: 1,
    title: 'Temporary lane closure on Harbor Avenue',
    department: 'Road',
    published_by_role: 'super_dept',
    detail: 'Road resurfacing begins at 6:00 AM on Thursday. Coordinated with Water Dept.',
    createdAt: '2026-08-06 09:30',
  },
  {
    id: 2,
    title: 'Water main overhaul & trenching schedule',
    department: 'Water',
    published_by_role: 'super_dept',
    detail: 'Water department trenching work start date confirmed. Unified window suggested.',
    createdAt: '2026-08-07 08:15',
  },
];

const departments = ['Road', 'Water', 'Telecom', 'Gas', 'Electricity'];

const departmentStaff = {
  Road: ['Alex Rivera', 'Lina Khan', 'Carlos Gomez'],
  Water: ['Tia Brooks', 'Omar Nunez', 'Sarah Jenkins'],
  Telecom: ['Mia Chen', 'David Kim', 'Rachel Vance'],
  Gas: ['Sam Patel', 'Vikram Singh', 'Elena Rostova'],
  Electricity: ['Jules Adams', 'Nina Shah', 'Marcus Brody'],
};

const initialAccounts = [
  { id: 1, name: 'System Super Admin', email: 'admin@roadguard.ai', role: 'super_admin', department: 'All' },
  { id: 2, name: 'Roads Super Dept', email: 'roads.head@roadguard.ai', role: 'super_dept', department: 'Road' },
  { id: 3, name: 'Water Super Dept', email: 'water.head@roadguard.ai', role: 'super_dept', department: 'Water' },
  { id: 4, name: 'Road Officer Alex', email: 'road.officer@roadguard.ai', role: 'dept_admin', department: 'Road' },
  { id: 5, name: 'Water Officer Tia', email: 'water.officer@roadguard.ai', role: 'dept_admin', department: 'Water' },
];

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    return localStorage.getItem('roadguard-theme') || 'dark';
  });

  const [user, setUser] = useState({
    id: 1,
    name: 'System Super Admin',
    email: 'admin@roadguard.ai',
    role: 'super_admin',
    department: 'All',
  });

  const [userAccounts, setUserAccounts] = useState(initialAccounts);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [notices, setNotices] = useState(initialNotices);
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Alex Rivera', email: 'alex@road.gov', role: 'super_dept', department: 'Road' },
    { id: 2, name: 'Sarah Waters', email: 'sarah@water.gov', role: 'dept_admin', department: 'Water' },
    { id: 3, name: 'Mark Gas', email: 'mark@gas.gov', role: 'dept_admin', department: 'Gas' },
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') {
      localStorage.setItem('roadguard-theme', theme);
    }
  }, [theme]);

  const login = (role, department, name, email) => {
    setUser({ id: Date.now(), role, department, name, email });
  };

  const logout = () => setUser(null);

  // Super Admin creates Super Dept accounts; Super Dept creates Dept Admin accounts for their own department
  const createAccount = ({ name, email, password, role, department }) => {
    if (!user) return null;

    // Super Admin creates Super Dept accounts only
    if (user.role === 'super_admin' && role !== 'super_dept') {
      alert('Super Admin can only create Super Dept Accounts.');
      return null;
    }

    // Super Dept creates Dept Admin accounts for their department only
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

    const newAcc = {
      id: Date.now(),
      name,
      email,
      role,
      department: user.role === 'super_admin' ? department : user.department,
      createdBy: user.name,
    };

    setUserAccounts((prev) => [newAcc, ...prev]);
    return newAcc;
  };

  // Submit citizen complaint
  const submitComplaint = (payload) => {
    const newComplaint = {
      id: Date.now(),
      title: payload.title,
      department: payload.department,
      status: 'Submitted',
      location: payload.location,
      description: payload.description,
      author: user?.name || 'Citizen',
      assignedStaff: null,
      likes: 0,
      comments: [],
      image: payload.image,
      confidence: 90,
      assignedStaff: '',
    };
    setComplaints((current) => [newComplaint, ...current]);
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
  const updateWorkOrderStatus = (id, newStatus) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin has read-only view of work orders.');
      return;
    }
    setWorkOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  // Create work order
  const createWorkOrder = (payload) => {
    if (user?.role === 'super_admin') {
      alert('Super Admin cannot create department work orders directly.');
      return null;
    }
    const nextOrder = {
      id: Date.now(),
      title: payload.title,
      department: user?.role === 'super_dept' || user?.role === 'dept_admin' ? user.department : payload.department,
      schedule: payload.schedule || '2026-08-20 to 2026-09-01',
      engineers: payload.engineers || 'Field Team Alpha',
      route: payload.route || 'Main Trenching Corridor',
      status: 'yet_to_start',
    };
    setWorkOrders((current) => [nextOrder, ...current]);
    return nextOrder;
  };

  // Publish Notice — Strictly reserved for Super Dept Accounts
  const publishNotice = (payload) => {
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

  const assignComplaintStaff = (id, staffName) => {
    setComplaints((current) =>
      current.map((complaint) => (complaint.id === id ? { ...complaint, assignedStaff: staffName } : complaint))
    );
  };

  const getVisibleWorkOrders = () => {
    if (!user) return [];
    if (user.role === 'super_admin') return workOrders;
    return workOrders.filter((item) => item.department.toLowerCase() === user.department.toLowerCase());
  };

  const getVisibleNotices = () => {
    if (!user) return [];
    if (user.role === 'super_admin') return notices;
    // Super Dept and Dept Admin see notices from their department
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
      notices,
      accounts,
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
    }),
    [theme, user, userAccounts, complaints, workOrders, notices]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
