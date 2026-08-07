import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AppContext = createContext(null);

const initialComplaints = [
  {
    id: 1,
    title: 'Pothole cluster near Harbor Avenue',
    department: 'Road',
    status: 'Under Review',
    location: 'Harbor Ave & 8th St',
    description: 'Multiple potholes have formed after heavy rain and are causing traffic hazards.',
    author: 'Mina Patel',
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
    likes: 16,
    comments: [{ author: 'Ops Desk', text: 'Field crew dispatched.' }],
    image: 'https://images.unsplash.com/photo-1581578017430-4d36e98c4b7b?auto=format&fit=crop&w=900&q=80',
    confidence: 88,
  },
  {
    id: 3,
    title: 'Downed power line after storm',
    department: 'Electricity',
    status: 'In Progress',
    location: 'Elm Ridge',
    description: 'A cable has fallen near a residential driveway and needs immediate inspection.',
    author: 'Jules Adams',
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
    schedule: '2026-08-12',
    engineers: 'A. Rivera, L. Khan',
    route: 'Harbor Ave corridor',
    status: 'Planned',
  },
  {
    id: 2,
    title: 'School gate water repair',
    department: 'Water',
    schedule: '2026-08-13',
    engineers: 'T. Brooks',
    route: 'Oak Street',
    status: 'In Progress',
  },
];

const initialNotices = [
  {
    id: 1,
    title: 'Temporary lane closure on Harbor Avenue',
    department: 'Road',
    detail: 'Road resurfacing begins at 6:00 AM on Thursday.',
  },
  {
    id: 2,
    title: 'Utility coordination alert',
    department: 'Super Admin',
    detail: 'A unified trenching plan has been suggested for the downtown corridor.',
  },
];

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return localStorage.getItem('roadguard-theme') || 'dark';
  });
  const [user, setUser] = useState(null);
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
    setUser({ role, department, name, email });
  };

  const logout = () => setUser(null);

  const submitComplaint = (payload) => {
    const newComplaint = {
      id: Date.now(),
      title: payload.title,
      department: payload.department,
      status: 'Submitted',
      location: payload.location,
      description: payload.description,
      author: user?.name || 'Citizen',
      likes: 0,
      comments: [],
      image: payload.image,
      confidence: 90,
      assignedStaff: '',
    };
    setComplaints((current) => [newComplaint, ...current]);
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

  const updateComplaintStatus = (id, status) => {
    setComplaints((current) => current.map((complaint) => (complaint.id === id ? { ...complaint, status } : complaint)));
  };

  const assignComplaintStaff = (id, staffName) => {
    setComplaints((current) =>
      current.map((complaint) => (complaint.id === id ? { ...complaint, assignedStaff: staffName } : complaint))
    );
  };

  const createWorkOrder = (payload) => {
    const nextOrder = {
      id: Date.now(),
      title: payload.title,
      department: payload.department,
      schedule: payload.schedule,
      engineers: payload.engineers,
      route: payload.route,
      status: 'yet_to_start',
    };
    setWorkOrders((current) => [nextOrder, ...current]);
    setNotices((current) => [
      {
        id: Date.now() + 1,
        title: `Work order published for ${payload.department}`,
        department: payload.department,
        detail: `${payload.title} is now visible to the public and affected partners.`,
      },
      ...current,
    ]);
  };

  const updateWorkOrderStatus = (id, status) => {
    setWorkOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order))
    );
  };

  const publishNotice = (payload) => {
    setNotices((current) => [
      {
        id: Date.now(),
        title: payload.title,
        department: payload.department,
        detail: payload.detail,
      },
      ...current,
    ]);
  };

  const createAccount = (payload) => {
    setAccounts((current) => [
      ...current,
      {
        id: Date.now(),
        name: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.department,
      },
    ]);
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      user,
      login,
      logout,
      complaints,
      workOrders,
      notices,
      accounts,
      submitComplaint,
      addComment,
      toggleLike,
      updateComplaintStatus,
      assignComplaintStaff,
      createWorkOrder,
      updateWorkOrderStatus,
      publishNotice,
      createAccount,
    }),
    [theme, user, complaints, workOrders, notices, accounts]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
