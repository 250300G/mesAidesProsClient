import { useState, useContext } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import service from "../../services/index.services";

import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  FormControl,
  FormLabel,
  Link,
  useToast
} from "@chakra-ui/react";

export default function Login() {

  const navigate = useNavigate();
  const toast = useToast();

  const { authenticateUser } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {

    e.preventDefault();

    setIsSubmitting(true);

    try {

      const response = await service.post("/auth/login", {
        email,
        password
      });

      // Stockage du JWT
      localStorage.setItem("authToken", response.data.authToken);

      // Synchronisation complète du contexte utilisateur
      await authenticateUser();

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre Cockpit de pilotage.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Redirection sécurisée vers le dashboard
      navigate("/dashboard");

    } catch (error) {

      console.error(error);

      toast({
        title: "Échec de la connexion",
        description:
          error.response?.data?.errorMessage ||
          "Identifiants incorrects.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });

    } finally {

      setIsSubmitting(false);
    }
  };

  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      bg="brand.bgLight"
      py={12}
    >
      <Container maxW="md">

        <VStack
          spacing={6}
          as="form"
          onSubmit={handleLogin}
          bg="white"
          p={8}
          borderRadius="2xl"
          shadow="xl"
          border="1px solid"
          borderColor="brand.border"
        >

          <Heading
            size="lg"
            color="brand.primary"
            textAlign="center"
          >
            Accéder à mon espace
          </Heading>

          <FormControl isRequired>

            <FormLabel
              fontWeight="semibold"
              fontSize="sm"
              color="brand.primary"
            >
              Adresse Email
            </FormLabel>

            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dirigeant@entreprise.fr"
              focusBorderColor="brand.accent"
            />

          </FormControl>

          <FormControl isRequired>

            <FormLabel
              fontWeight="semibold"
              fontSize="sm"
              color="brand.primary"
            >
              Mot de passe
            </FormLabel>

            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              focusBorderColor="brand.accent"
            />

          </FormControl>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Ouverture du coffre-fort..."
            w="full"
            h="55px"
            bg="brand.primary"
            color="white"
            _hover={{ opacity: 0.9 }}
            borderRadius="xl"
          >
            Se connecter au Cabinet ➔
          </Button>

          <Text
            fontSize="sm"
            color="brand.secondary"
            textAlign="center"
            mt={2}
          >
            Nouveau sur la plateforme ?{" "}

            <Link
              as={RouterLink}
              to="/signup"
              color="brand.accent"
              fontWeight="bold"
            >
              Créer un compte
            </Link>

          </Text>

        </VStack>

      </Container>
    </Box>
  );
}