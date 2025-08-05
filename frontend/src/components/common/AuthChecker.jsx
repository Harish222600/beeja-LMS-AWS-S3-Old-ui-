import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/operations/authAPI';
import { toast } from 'react-hot-toast';

const AuthChecker = ({ children }) => {
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const lastCheckTime = useRef(0);
  const hasShownError = useRef(false);

  useEffect(() => {
    // Function to check if token is valid
    const checkTokenValidity = async () => {
      if (!token || isChecking) return;

      // Prevent frequent checks - only check once every 30 seconds
      const now = Date.now();
      if (now - lastCheckTime.current < 30000) return;
      lastCheckTime.current = now;

      // Basic token format validation
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          if (!hasShownError.current) {
            console.log('Invalid token format');
            toast.error('Session expired. Please login again.');
            hasShownError.current = true;
            dispatch(logout(navigate));
          }
          return;
        }

        // Decode token payload to check expiration
        const payload = JSON.parse(atob(tokenParts[1]));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          if (!hasShownError.current) {
            console.log('Token has expired');
            toast.error('Session expired. Please login again.');
            hasShownError.current = true;
            dispatch(logout(navigate));
          }
          return;
        }

        // Reset error flag if token is valid
        hasShownError.current = false;

      } catch (error) {
        if (!hasShownError.current) {
          console.log('Error parsing token:', error);
          toast.error('Session expired. Please login again.');
          hasShownError.current = true;
          dispatch(logout(navigate));
        }
      }
    };

    // Only check token validity if we have a token
    if (token) {
      // Add a delay to prevent immediate validation after login
      const timeoutId = setTimeout(() => {
        checkTokenValidity();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [token, user, dispatch, navigate, isChecking]);

  return children;
};

export default AuthChecker;
