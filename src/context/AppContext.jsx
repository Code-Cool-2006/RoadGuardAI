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

const departments = ['Road', 'Water', 'Gas', 'Electricity'];

const departmentStaff = {
  Road: ['Alex Rivera', 'Lina Khan'],
  Water: ['Tia Brooks', 'Omar Nunez'],
  Gas: ['Sam Patel', 'Mia Chen'],
  Electricity: ['Jules Adams', 'Nina Shah'],
};

const initialUsers = [
  { id: 1, name: 'City Control', email: 'super@roadguard.ai', role: 'super_admin', department: 'All Departments' },
  { id: 2, name: 'Road Super Dept', email: 'road-dept@roadguard.ai', role: 'super_dept', department: 'Road' },
  { id: 3, name: 'Water Super Dept', email: 'water-dept@roadguard.ai', role: 'super_dept', department: 'Water' },
];

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return localStorage.getItem('roadguard-theme') || 'dark';
  });
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [workOrders, setWorkOrders] = useState(initialWorkOrders);
  const [notices, setNotices] = useState(initialNotices);

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

  const hasDepartmentAccess = (department) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (user.role === 'super_dept' || user.role === 'dept_admin') return user.department === department;
    return false;
  };

  const createAccount = ({ name, email, password, role, department }) => {
    if (!user) return null;
    if (user.role === 'super_admin' && role !== 'super_dept') {
      return null;
    }
    if (user.role === 'super_dept' && role !== 'dept_admin') {
      return null;
    }
    if (user.role !== 'super_admin' && user.role !== 'super_dept') {
      return null;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      role,
      department: role === 'super_admin' ? 'All Departments' : department,
    };
    setUsers((current) => [newUser, ...current]);
    return newUser;
  };

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
    if (!user || (user.role !== 'super_dept' && user.role !== 'dept_admin')) return null;
    setComplaints((current) => current.map((complaint) => (complaint.id === id ? { ...complaint, status } : complaint)));
  };

  const assignComplaint = (id, assigned_to) => {
    if (!user || (user.role !== 'super_dept' && user.role !== 'dept_admin')) return null;
    setComplaints((current) =>
      current.map((complaint) => (complaint.id === id ? { ...complaint, assigned_to } : complaint))
    );
  };

  const updateWorkOrderStatus = (id, status) => {
    if (!user || (user.role !== 'super_dept' && user.role !== 'dept_admin')) return null;
    setWorkOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
  };

  const createWorkOrder = (payload) => {
    if (!user || (user.role !== 'super_dept' && user.role !== 'dept_admin')) return null;
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
    return nextOrder;
  };

  const publishNotice = (payload) => {
    if (user?.role !== 'super_dept') return;
    setNotices((current) => [
      {
        id: Date.now(),
        title: payload.title,
        department: user.department,
        detail: payload.detail,
        published_by: user?.name || 'System',
      },
      ...current,
    ]);
  };

  const getVisibleComplaints = () => {
    if (!user) return [];
    if (user.role === 'super_admin' || user.role === 'citizen') return complaints;
    return complaints.filter((item) => item.department === user.department);
  };

  const getVisibleWorkOrders = () => {
    if (!user) return [];
    if (user.role === 'super_admin' || user.role === 'citizen') return workOrders;
    return workOrders.filter((item) => item.department === user.department);
  };

  const getVisibleNotices = () => {
    if (!user) return [];
    if (user.role === 'super_admin' || user.role === 'citizen') return notices;
    if (user.role === 'super_dept' || user.role === 'dept_admin') return notices.filter((item) => item.department === user.department);
    return notices;
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      user,
      users,
      departments,
      departmentStaff,
      login,
      logout,
      hasDepartmentAccess,
      createAccount,
      complaints,
      workOrders,
      notices,
      submitComplaint,
      addComment,
      toggleLike,
      updateComplaintStatus,
      assignComplaint,
      updateWorkOrderStatus,
      createWorkOrder,
      publishNotice,
      getVisibleComplaints,
      getVisibleWorkOrders,
      getVisibleNotices,
    }),
    [theme, user, users, complaints, workOrders, notices]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
