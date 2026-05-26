import { useState, useContext } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import service from "../../services/index.services";
import {
  Box, Container, Heading, Text, Input, Button, VStack,
  FormControl, FormLabel, FormErrorMessage, Link, useToast, SimpleGrid, Divider
} from "@chakra-ui/react";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { authenticateUser } = useContext(AuthContext);

  // ✅ Pré-remplissage du SIRET transmis depuis la SimulationPage
  const pendingSiret = location.state?.pendingSiret || "";

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    siret: pendingSiret,
    companyName: "",
    codeNaf: "",
    region: "",
    revenue: "",
    employeeCount: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Efface l'erreur au retape
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "L'email est obligatoire.";
    if (!formData.username) newErrors.username = "Le nom d'utilisateur est obligatoire.";
    if (!formData.password) newErrors.password = "Le mot de passe est obligatoire.";
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(formData.password)) {
      newErrors.password = "Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.";
    }
    if (!/^\d{14}$/.test(formData.siret)) {
      newErrors.siret = "Le SIRET doit contenir exactement 14 chiffres.";
    }
    return newErrors;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await service.post("/auth/signup", {
        ...formData,
        revenue: formData.revenue ? Number(formData.revenue) : 0,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : 0
      });

      // Connexion automatique post-inscription
      const loginResponse = await service.post("/auth/login", {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem("authToken", loginResponse.data.authToken);
      await authenticateUser();

      toast({
        title: "Compte créé avec succès !",
        description: "Vos aides ont été pré-sélectionnées dans votre cockpit.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      navigate("/dashboard");

    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.response?.data?.errorMessage || "Une erreur est survenue.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="80vh" bg="brand.bgLight" py={12} px={4}>
      <Container maxW="lg">
        <VStack
          spacing={6}
          as="form"
          onSubmit={handleSignup}
          bg="white"
          p={{ base: 6, md: 8 }}
          borderRadius="2xl"
          shadow="xl"
          border="1px solid"
          borderColor="brand.border"
        >
          <Box textAlign="center" w="full">
            <Heading size="lg" color="brand.primary">
              Créer mon espace dirigeant
            </Heading>
            <Text fontSize="sm" color="brand.secondary" mt={1}>
              {pendingSiret
                ? `Votre SIRET ${pendingSiret} a été pré-rempli depuis votre simulation.`
                : "Accédez à votre cockpit de subventions en 2 minutes."}
            </Text>
          </Box>

          {/* Identifiants */}
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <FormControl isRequired isInvalid={!!errors.email}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Email professionnel</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="dirigeant@entreprise.fr"
                focusBorderColor="brand.accent"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.username}>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Nom d'utilisateur</FormLabel>
              <Input
                value={formData.username}
                onChange={handleChange("username")}
                placeholder="Jean Martin"
                focusBorderColor="brand.accent"
              />
              <FormErrorMessage>{errors.username}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired isInvalid={!!errors.password} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Mot de passe</FormLabel>
            <Input
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              placeholder="Min. 8 caractères, 1 maj, 1 chiffre"
              focusBorderColor="brand.accent"
            />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Divider />

          {/* Données entreprise */}
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" w="full">
            Informations entreprise
          </Text>

          <FormControl isRequired isInvalid={!!errors.siret} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">
              SIRET (14 chiffres)
            </FormLabel>
            <Input
              type="text"
              maxLength={14}
              value={formData.siret}
              onChange={handleChange("siret")}
              placeholder="Ex: 02404058600018"
              fontFamily="mono"
              letterSpacing="widest"
              focusBorderColor="brand.accent"
              bg={pendingSiret ? "green.50" : "white"}
              borderColor={pendingSiret ? "green.300" : "inherit"}
            />
            <FormErrorMessage>{errors.siret}</FormErrorMessage>
          </FormControl>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Raison sociale</FormLabel>
              <Input
                value={formData.companyName}
                onChange={handleChange("companyName")}
                placeholder="Nom de votre entreprise"
                focusBorderColor="brand.accent"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Code NAF / APE</FormLabel>
              <Input
                value={formData.codeNaf}
                onChange={handleChange("codeNaf")}
                placeholder="Ex: 4321A"
                fontFamily="mono"
                focusBorderColor="brand.accent"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Région</FormLabel>
              <Input
                value={formData.region}
                onChange={handleChange("region")}
                placeholder="Ex: IDF, ARA, NATIONAL..."
                focusBorderColor="brand.accent"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Chiffre d'affaires (€)</FormLabel>
              <Input
                type="number"
                min="0"
                value={formData.revenue}
                onChange={handleChange("revenue")}
                placeholder="Ex: 250000"
                focusBorderColor="brand.accent"
              />
            </FormControl>
          </SimpleGrid>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText="Création du compte..."
            w="full"
            h="55px"
            bg="brand.primary"
            color="white"
            _hover={{ opacity: 0.9 }}
            borderRadius="xl"
            fontSize="md"
            fontWeight="bold"
          >
            Accéder à mon Cockpit ➔
          </Button>

          <Text fontSize="sm" color="brand.secondary" textAlign="center">
            Déjà inscrit ?{" "}
            <Link as={RouterLink} to="/login" color="brand.accent" fontWeight="bold">
              Se connecter
            </Link>
          </Text>

        </VStack>
      </Container>
    </Box>
  );
}
