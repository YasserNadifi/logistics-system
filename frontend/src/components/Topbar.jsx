import { useNavigate, Link } from 'react-router-dom';

export const Topbar = () => {
  const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'))

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <header
      style={{
        width: '100vw',
        background: '#fff',
        borderBottom: '1px solid #ddd',
        padding: '0.5rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Left side: logo or app name */}
      <Link to="/dashboard" style={{ textDecoration: 'none', color: '#333' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>MyApp</h2>
      </Link>
        
        <span style={{ margin: 0, fontSize: '1.25rem' }}>Hello {user.fullName}</span>

      {/* Right side: user info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <>
            
            <button
              onClick={handleLogout}
            //   style={{
            //     background: 'transparent',
            //     border: 'none',
            //     cursor: 'pointer',
            //     color: '#007bff',
            //   }}
              className="btn btn-danger"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );

}
