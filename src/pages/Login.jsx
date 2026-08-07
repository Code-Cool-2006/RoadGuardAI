import { useEffect, useMemo, useState } from 'react';

const roles = [
  { id: 'citizen', label: 'Citizen', icon: 'person' },
  { id: 'dept_admin', label: 'Dept Admin', icon: 'admin_panel_settings' },
  { id: 'super_admin', label: 'Super Admin', icon: 'supervisor_account' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const deptDropdownVisible = selectedRole === 'dept_admin';

  const roleButtonClass = (roleId) => {
    const active = selectedRole === roleId;
    return [
      'role-selector-btn',
      'flex',
      'flex-col',
      'items-center',
      'justify-center',
      'p-4',
      'rounded-lg',
      'transition-colors',
      'duration-200',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-offset-2',
      'focus:ring-primary',
      active
        ? 'border-2 border-primary bg-primary-fixed text-on-primary-fixed'
        : 'border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest',
    ].join(' ');
  };

  const pageIcon = useMemo(
    () => (passwordVisible ? 'visibility_off' : 'visibility'),
    [passwordVisible]
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      role: selectedRole,
      department: formData.get('department'),
      email: formData.get('email'),
      password: formData.get('password'),
      remember: formData.get('remember') === 'on',
    };

    console.log('Login submit', payload);
  };

  return (
    <div className="bg-surface-container-low text-on-background min-h-screen flex flex-col antialiased overflow-hidden font-body-md">
      <div className="w-full bg-surface-container-highest text-on-surface py-2 px-4 flex items-center justify-center gap-2 border-b border-outline-variant z-50">
        <span className="material-symbols-outlined text-base">account_balance</span>
        <span className="font-label-md text-label-md uppercase tracking-wider">Official Government System</span>
      </div>
      <div className="flex flex-col md:flex-row flex-1 h-full">
        <div className="relative hidden md:flex md:w-1/2 min-h-full bg-surface-container-high flex-col justify-center items-start overflow-hidden p-margin-desktop border-r border-outline-variant">
          <img
            alt="Municipal Architecture"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6yi8pS6roJAO3Ut4UIB5qYk5vHL6Zy2X9WmmCx_gb_lnDw2wa8jF593foToSFwIKpexg6_wUwBkdOOpD6cDuQesvzpokvjqFAtVyy90w5qJu9D8dfazh-oCzPu-4v84BdurDnRK9EC-bPckgdAumgDUHfIR0L-LicWirzc4d36JVFolskTa4pOWWatRzrNGfCeNL_i0NHVu3op5hFZR5tXFzySXU-1JJBs8VMZBnuQ12FKycw5yw"
          />
          <div className="relative z-10 w-full max-w-lg space-y-6 drop-shadow-sm p-8 bg-surface-container-lowest/90 backdrop-blur-sm border border-outline-variant rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-4xl text-primary">location_city</span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">RoadGuard AI</h1>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Smart Infrastructure Coordination &amp; Citizen Complaint System</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Report infrastructure issues effortlessly and coordinate city works to ensure smooth, safe, and efficient urban management.
            </p>
          </div>
          <div className="absolute bottom-8 left-8 flex items-center gap-2 text-on-surface-variant font-label-md text-label-md bg-surface-container-lowest/80 px-4 py-2 rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-sm">lock</span>
            Secure connection established
          </div>
        </div>

        <div className="w-full md:w-1/2 min-h-full flex flex-col justify-center items-center p-8 bg-surface-container-low relative">
          <div className="absolute top-8 right-8 z-20">
            <button
              aria-label="Toggle Theme"
              className="p-2 rounded-full hover:bg-surface-container-highest transition-colors text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary flex items-center justify-center"
              onClick={() => setDarkMode((current) => !current)}
              type="button"
            >
              <span className="material-symbols-outlined">{darkMode ? 'dark_mode' : 'light_mode'}</span>
            </button>
          </div>

          <div className="w-full max-w-md bg-surface-container rounded-xl border border-outline-variant p-8 shadow-sm">
            <div className="mb-8 text-center">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome Back</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Select your role to proceed</p>
            </div>

            <div aria-label="Select User Role" className="grid grid-cols-3 gap-4 mb-8" role="group">
              {roles.map((role) => (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={selectedRole === role.id}
                  className={roleButtonClass(role.id)}
                  onClick={() => setSelectedRole(role.id)}
                >
                  <span className="material-symbols-outlined mb-2 text-2xl">{role.icon}</span>
                  <span className="font-label-md text-label-md">{role.label}</span>
                </button>
              ))}
            </div>

            <form className="space-y-6" id="loginForm" onSubmit={handleSubmit}>
              <div className={`transition-opacity duration-200 space-y-2 ${deptDropdownVisible ? 'opacity-100' : 'opacity-0 hidden'}`}>
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="department">
                  Department
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 px-4 appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
                    id="department"
                    name="department"
                    defaultValue="roads"
                  >
                    <option value="roads">Roads &amp; Highways</option>
                    <option value="water">Water Management</option>
                    <option value="gas">Gas Infrastructure</option>
                    <option value="electricity">Electrical Grid</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">mail</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                    id="email"
                    name="email"
                    placeholder="name@example.com"
                    required
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">lock</span>
                  <input
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type={passwordVisible ? 'text' : 'password'}
                  />
                  <button
                    aria-label="Toggle Password Visibility"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary rounded"
                    id="togglePassword"
                    type="button"
                    onClick={() => setPasswordVisible((current) => !current)}
                  >
                    <span className="material-symbols-outlined">{pageIcon}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    className="form-checkbox h-4 w-4 text-primary bg-surface-container-lowest border-outline-variant rounded focus:ring-primary focus:ring-offset-surface-container"
                    type="checkbox"
                    name="remember"
                  />
                  <span className="font-body-md text-body-md text-on-surface-variant">Remember me</span>
                </label>
                <a className="font-body-md text-body-md font-medium text-on-surface hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded" href="#">
                  Forgot Password?
                </a>
              </div>

              <button
                className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-surface-container flex items-center justify-center space-x-2"
                type="submit"
              >
                <span>Login to System</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="mt-8 text-center border-t border-outline-variant pt-6">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don&apos;t have an account?{' '}
                <a className="text-on-surface font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary rounded" href="#">
                  Register here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
