import { useState, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import service from "../../services/index.services";
import { Box, Container, Heading, Text, Input, Button, VStack, FormControl, FormLabel, FormErrorMessage, Link, useToast } from "@chakra-ui/react";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Utilisation des méthodes globales d'authentification de ton école
  const { setIsLoggedIn, setLoggedUserId, setLoggedUserRole } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await service.post("/auth/login", { email, password });
      
      // Stockage sécurisé du token d'authentification
      localStorage.setItem("authToken", response.data.authToken);

      // Mise à jour synchrone des états globaux de session de ton école
      setIsLoggedIn(true);
      setLoggedUserId(response.data.payload._id);
      setLoggedUserRole(response.data.payload.role);

      toast({
        title: "Connexion réussie.",
        description: "Bienvenue sur votre tableau de bord.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirection instantanée vers l'espace de gestion privé
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errorMessage) {
        setError(err.response.data.errorMessage);
      } else {
        setError("Identifiants incorrects ou serveur indisponible.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="85vh" display="flex" alignItems="center" bg="brand.bgLight" py={8} px={4}>
      <Container maxW="md" bg="brand.cardBg" p={{ base: 6, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="brand.border" shadow="sm">
        <VStack as="form" onSubmit={handleLogin} spacing={5} align="stretch">
          
          <Box textAlign="center" mb={1}>
            <Heading as="h2" size="lg" color="brand.primary" fontWeight="black" letterSpacing="tight">
              Espace Dirigeant
            </Heading>
            <Text fontSize="sm" color="brand.secondary" mt={1}>
              Accédez à votre Cockpit Macro-Financier.
            </Text>
          </Box>

          {error && (
            <Text color="red.500" fontSize="sm" textAlign="center" fontWeight="medium">
              ⚠️ {error}
            </Text>
          )}

          <FormControl isRequired>
            <FormLabel fontWeight="semibold" fontSize="sm" color="brand.primary">Adresse Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.fr"
              focusBorderColor="brand.accent"
              borderColor="brand.border"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="semibold" fontSize="sm" color="brand.primary">Mot de passe</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              focusBorderColor="brand.accent"
              borderColor="brand.border"
            />
          </FormControl>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Vérification des accès..."
            w="full"
            h="50px"
            bg="brand.primary"
            color="white"
            _hover={{ opacity: 0.9 }}
            mt={2}
          >
            Se connecter au Cabinet ➔
          </Button>

          <Text fontSize="sm" color="brand.secondary" textAlign="center" mt={2}>
            Nouveau sur la plateforme ?{" "}
            <Link as={RouterLink} to="/signup" color="brand.accent" fontWeight="bold" _hover={{ textDecoration: "none" }}>
              Créer un compte
            </Link>
          </Text>

        </VStack>
      </Container>
    </Box>
  );
}