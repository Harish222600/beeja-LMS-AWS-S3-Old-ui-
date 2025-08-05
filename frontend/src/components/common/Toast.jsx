import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={12}
      containerClassName=""
      containerStyle={{
        top: 100,
        zIndex: 9999,
      }}
      toastOptions={{
        className: '',
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(30, 30, 30, 0.95) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '1.25rem',
          padding: '16px 20px',
          boxShadow: '0 20px 50px -15px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          maxWidth: '450px',
          minWidth: '300px',
          transform: 'translateZ(0)',
          animation: 'slideInDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        },

        success: {
          style: {
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(16, 185, 129, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 20px 50px -15px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: 'rgba(34, 197, 94, 0.95)',
          },
        },

        error: {
          style: {
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 20px 50px -15px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: 'rgba(239, 68, 68, 0.95)',
          },
        },

        loading: {
          style: {
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95) 0%, rgba(37, 99, 235, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 20px 50px -15px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: 'rgba(59, 130, 246, 0.95)',
          },
        },

        custom: {
          style: {
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95) 0%, rgba(217, 119, 6, 0.95) 100%)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            boxShadow: '0 20px 50px -15px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          },
        },
      }}
    />
  );
};

export default Toast;
