import { useState } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import service from "../../services/index.services";
import { Box, Container, Heading, Text, Input, Button, VStack, FormControl, FormLabel, FormErrorMessage, Link, useToast } from "@chakra-ui/react";

export default function Signup() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Interception intelligente du SIRET passé en mémoire depuis l'étape précédente
  const pendingSiret = location.state?.pendingSiret || "";

  // États du formulaire
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // États de gestion UI (Chargement et Erreurs)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Payload de base conforme aux attentes de l'école
    const payload = { username, email, password };

    // Si un SIRET est en attente, on l'ajoute au payload pour le lier au compte créé
    if (pendingSiret) {
      payload.siret = pendingSiret;
    }

    try {
      await service.post("/auth/signup", payload);
      
      toast({
        title: "Compte créé avec succès.",
        description: "Vous pouvez maintenant vous connecter à votre Cockpit.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errorMessage) {
        setErrors({ server: err.response.data.errorMessage });
      } else {
        setErrors({ server: "Une erreur est survenue lors de l'inscription. Vérifiez votre connexion." });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="85vh" display="flex" alignItems="center" bg="brand.bgLight" py={8} px={4}>
      <Container maxW="md" bg="brand.cardBg" p={{ base: 6, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="brand.border" shadow="sm">
        <VStack as="form" onSubmit={handleSignup} spacing={4} align="stretch">
          
          <Box textAlign="center" mb={2}>
            <Heading as="h2" size="lg" color="brand.primary" fontWeight="black" letterSpacing="tight">
              Créer mon Cockpit
            </Heading>
            {pendingSiret && (
              <Text fontSize="xs" color="brand.accent" fontWeight="bold" mt={1}>
                Structure identifiée : SIRET {pendingSiret}
              </Text>
            )}
          </Box>

          {errors.server && (
            <Text color="red.500" fontSize="sm" textAlign="center" fontWeight="medium">
              ⚠️ {errors.server}
            </Text>
          )}

          <FormControl isRequired isInvalid={!!errors.username}>
            <FormLabel fontWeight="semibold" fontSize="sm" color="brand.primary">Nom d&apos;utilisateur</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: Jean Dupont"
              focusBorderColor="brand.accent"
              borderColor="brand.border"
            />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.email}>
            <FormLabel fontWeight="semibold" fontSize="sm" color="brand.primary">Adresse Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jean.dupont@entreprise.fr"
              focusBorderColor="brand.accent"
              borderColor="brand.border"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password}>
            <FormLabel fontWeight="semibold" fontSize="sm" color="brand.primary">Mot de passe</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              focusBorderColor="brand.accent"
              borderColor="brand.border"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Création du Cockpit en cours..."
            w="full"
            h="50px"
            bg="brand.accent"
            color="white"
            _hover={{ opacity: 0.9 }}
            mt={4}
          >
            Valider et piloter mes aides ➔
          </Button>

          <Text fontSize="sm" color="brand.secondary" textAlign="center" mt={2}>
            Déjà inscrit ?{" "}
            <Link as={RouterLink} to="/login" color="brand.primary" fontWeight="bold" _hover={{ textDecoration: "none" }}>
              Se connecter
            </Link>
          </Text>

        </VStack>
      </Container>
    </Box>
  );
}