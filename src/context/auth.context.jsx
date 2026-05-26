import service from "../services/index.services";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext();

function AuthWrapper(props) {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedUserId, setLoggedUserId] = useState(null);
  const [loggedUserRole, setLoggedUserRole] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const authenticateUser = async () => {

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      setIsAuthenticating(false);
      return;
    }

    try {

      const response = await service.get("/auth/verify");

      setIsLoggedIn(true);
      setLoggedUserId(response.data.payload._id);
      setLoggedUserRole(response.data.payload.role);

      setIsAuthenticating(false);

    } catch (error) {

      console.log(error);

      setIsLoggedIn(false);
      setLoggedUserId(null);
      setLoggedUserRole(null);

      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  if (isAuthenticating) {
    return <h3>Authenticating user...</h3>;
  }

const passedContext = {
  isLoggedIn,
  setIsLoggedIn,
  loggedUserId,
  setLoggedUserId,
  loggedUserRole,
  setLoggedUserRole,
  isAuthenticating,
  authenticateUser
};

  return (
    <AuthContext.Provider value={passedContext}>
      {props.children}
    </AuthContext.Provider>
  );
}

AuthWrapper.propTypes = {
  children: PropTypes.node,
};

export {
  AuthContext,
  AuthWrapper
};