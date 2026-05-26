import { useContext } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../context/auth.context";
import { Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";

function PrivateOnly(props) {
  const { isLoggedIn, isAuthenticating } = useContext(AuthContext);

  // 1. Pendant que le backend vérifie le jeton JWT, on affiche un loader
  if (isAuthenticating) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.primary" thickness="4px" />
      </Center>
    );
  }

  // 2. Si l'utilisateur n'est pas connecté, redirection forcée vers le login
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  // 3. Si tout est OK, on affiche la page privée (Dashboard ou Profile)
  return props.children;
}

// Validation minimale des props pour éviter le warning ESLint
PrivateOnly.propTypes = {
  children: PropTypes.node,
};

export default PrivateOnly;