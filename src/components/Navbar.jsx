// components/Navbar.jsx
import { useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { Box, Flex, Text, Button, Link, Badge, HStack } from "@chakra-ui/react";

export default function Navbar() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setLoggedUserId, setLoggedUserRole, isLoggedIn, loggedUserRole } =
    useContext(AuthContext);

  function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem("authToken");
    setIsLoggedIn(false);
    setLoggedUserId(null);
    setLoggedUserRole(null);
    navigate("/login");
  }

  return (
    <Box
      as="nav"
      bg="brand.cardBg"
      borderBottom="1px solid"
      borderColor="brand.border"
      px={{ base: 4, md: 8 }}
      h="70px"
    >
      <Flex h="full" align="center" justify="space-between" maxW="7xl" mx="auto">

        {/* LOGO */}
        <HStack spacing={3}>
          <Link
            as={RouterLink}
            to="/"
            fontSize="lg"
            fontWeight="black"
            color="brand.primary"
            _hover={{ textDecoration: "none" }}
          >
            Aides<Text as="span" color="brand.accent">Pros</Text>
          </Link>
          <Badge
            colorScheme={isLoggedIn ? "blue" : "green"}
            variant="subtle"
            fontSize="9px"
            px={2}
            py={0.5}
            borderRadius="md"
            display={{ base: "none", sm: "inline-block" }}
          >
            {isLoggedIn ? "Espace Sécurisé" : "● Live Data"}
          </Badge>
        </HStack>

        {/* NAVIGATION CENTRALE — toujours visible */}
        <HStack spacing={6} display={{ base: "none", md: "flex" }}>
          <Link
            as={RouterLink}
            to="/"
            fontSize="sm"
            fontWeight="medium"
            color="brand.secondary"
            _hover={{ color: "brand.primary", textDecoration: "none" }}
          >
            Accueil
          </Link>
          <Link
            as={RouterLink}
            to="/funds"
            fontSize="sm"
            fontWeight="medium"
            color="brand.secondary"
            _hover={{ color: "brand.primary", textDecoration: "none" }}
          >
            Explorer les aides
          </Link>
          <Link
            as={RouterLink}
            to="/simulation"
            fontSize="sm"
            fontWeight="medium"
            color="brand.secondary"
            _hover={{ color: "brand.primary", textDecoration: "none" }}
          >
            Simulation
          </Link>
          {isLoggedIn && (
            <Link
              as={RouterLink}
              to="/dashboard"
              fontSize="sm"
              fontWeight="medium"
              color="brand.secondary"
              _hover={{ color: "brand.primary", textDecoration: "none" }}
            >
              Mon Cockpit
            </Link>
          )}
          {isLoggedIn && loggedUserRole === "admin" && (
            <Link
              as={RouterLink}
              to="/admin"
              fontSize="sm"
              fontWeight="medium"
              color="red.400"
              _hover={{ color: "red.600", textDecoration: "none" }}
            >
              Admin
            </Link>
          )}
        </HStack>

        {/* ACTIONS DROITE */}
        <Flex align="center" gap={4}>
          {!isLoggedIn ? (
            <>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                color="brand.secondary"
                fontSize="sm"
                fontWeight="medium"
                _hover={{ color: "brand.primary", bg: "gray.50" }}
              >
                Connexion
              </Button>
              <Button
                as={RouterLink}
                to="/signup"
                bg="brand.primary"
                color="white"
                size="sm"
                px={4}
                fontSize="xs"
                _hover={{ opacity: 0.9 }}
                display={{ base: "none", sm: "inline-flex" }}
              >
                Inscription
              </Button>
            </>
          ) : (
            <HStack spacing={3}>
              <Button
                as={RouterLink}
                to="/profile"
                variant="ghost"
                color="brand.secondary"
                size="sm"
                fontSize="xs"
                _hover={{ color: "brand.primary", bg: "gray.50" }}
              >
                Mon profil
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                borderColor="brand.border"
                color="brand.secondary"
                size="sm"
                fontSize="xs"
                _hover={{ bg: "gray.50", color: "brand.primary" }}
              >
                Déconnexion
              </Button>
            </HStack>
          )}
        </Flex>

      </Flex>
    </Box>
  );
}
