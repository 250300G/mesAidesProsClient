import { useContext } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import { Box, Flex, Text, Button, Link, Badge, HStack } from "@chakra-ui/react";

export default function Navbar() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setLoggedUserId, isLoggedIn, setLoggedUserRole } = useContext(AuthContext);

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
        
        {/* À GAUCHE : Logo & Identité (S'adapte si connecté ou non) */}
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
          
          {/* Badge discret d'autorité de données pour rassurer l'utilisateur principal */}
          {!isLoggedIn ? (
            <Badge colorScheme="emerald" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md" display={{ base: "none", sm: "inline-block" }}>
              ● Live Data
            </Badge>
          ) : (
            <Badge colorScheme="blue" variant="subtle" fontSize="9px" px={2} py={0.5} borderRadius="md">
              Espace Sécurisé
            </Badge>
          )}
        </HStack>

        {/* AU MILIEU : Liens de navigation dynamiques (Uniquement si connecté) */}
        {isLoggedIn && (
          <HStack spacing={6} display={{ base: "none", md: "flex" }}>
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
            <Link 
              as={RouterLink} 
              to="/dashboard" 
              fontSize="sm" 
              fontWeight="medium" 
              color="brand.secondary" 
              _hover={{ color: "brand.primary", textDecoration: "none" }}
            >
              Configuration
            </Link>
          </HStack>
        )}

        {/* À DROITE : Actions d'authentification asymétriques */}
        <Flex align="center" gap={4}>
          {!isLoggedIn ? (
            <>
              {/* Proposer directement et élégamment la connexion depuis l'accueil */}
              <Button 
                as={RouterLink} 
                to="/login" 
                variant="ghost" 
                color="brand.secondary" 
                fontSize="sm"
                fontWeight="medium"
                _hover={{ color: "brand.primary", bg: "gray.50" }}
              >
                Accès Cabinet
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
            <HStack spacing={4}>
              {/* Menu mobile d'appoint pour les pages privées */}
              <Link 
                as={RouterLink} 
                to="/dashboard" 
                fontSize="xs" 
                color="brand.secondary" 
                display={{ base: "inline-block", md: "none" }}
              >
                Paramètres
              </Link>
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

