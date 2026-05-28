import { useState, useContext, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import service from "../../services/index.services";
import {
  Box, Container, Heading, Text, Input, Button, VStack,
  FormControl, FormLabel, FormErrorMessage, Link, useToast,
  Divider, Spinner, Flex, Badge
} from "@chakra-ui/react";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { authenticateUser } = useContext(AuthContext);
  const siretLookupTimer = useRef(null);

  const pendingSiret = location.state?.pendingSiret || "";

  const [siret, setSiret] = useState(pendingSiret);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [companyData, setCompanyData] = useState(null);
  const [siretLookupState, setSiretLookupState] = useState("idle");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lookup SIRET avec debounce 500ms
  useEffect(() => {
    const cleanSiret = siret.replace(/\s/g, "");
    if (cleanSiret.length !== 14) {
      setCompanyData(null);
      setSiretLookupState("idle");
      return;
    }
    setSiretLookupState("loading");
    clearTimeout(siretLookupTimer.current);
    siretLookupTimer.current = setTimeout(async () => {
      try {
        const res = await service.get(`/sirene/lookup?siret=${cleanSiret}`);
        setCompanyData(res.data);
        setSiretLookupState("found");
      } catch (err) {
        setSiretLookupState(err.response?.status === 404 ? "notfound" : "error");
        setCompanyData(null);
      }
    }, 500);
    return () => clearTimeout(siretLookupTimer.current);
  }, [siret]);

  const validate = () => {
    const e = {};
    if (!email) e.email = "L'email est obligatoire.";
    if (!username) e.username = "Votre nom est obligatoire.";
    if (!password) e.password = "Le mot de passe est obligatoire.";
    if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(password))
      e.password = "Minimum 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre.";
    if (!/^\d{14}$/.test(siret.replace(/\s/g, "")))
      e.siret = "Le SIRET doit contenir exactement 14 chiffres.";
    return e;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsSubmitting(true);
    try {
      await service.post("/auth/signup", {
        email, username, password,
        siret: siret.replace(/\s/g, ""),
        companyName: companyData?.companyName || "",
        codeNaf: companyData?.codeNaf || "",
        region: companyData?.region || "",
        codePostal: companyData?.codePostal || "",
        revenue: companyData?.revenue || 0,
        employeeCount: companyData?.employeeCount || 0
      });
      const loginRes = await service.post("/auth/login", { email, password });
      localStorage.setItem("authToken", loginRes.data.authToken);
      await authenticateUser();
      toast({ title: "Bienvenue !", description: companyData?.companyName ? `Cockpit créé pour ${companyData.companyName}.` : "Cockpit créé avec succès.", status: "success", duration: 4000 });
      navigate("/dashboard");
    } catch (error) {
      toast({ title: "Erreur d'inscription", description: error.response?.data?.errorMessage || "Une erreur est survenue.", status: "error", duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box minH="80vh" bg="brand.bgLight" py={12} px={4}>
      <Container maxW="md">
        <VStack spacing={5} as="form" onSubmit={handleSignup} bg="white" p={{ base: 6, md: 8 }} borderRadius="2xl" shadow="xl" border="1px solid" borderColor="brand.border">
          <Box textAlign="center" w="full">
            <Heading size="lg" color="brand.primary">Créer mon espace</Heading>
           
          </Box>

          {/* SIRET */}
          <FormControl isRequired isInvalid={!!errors.siret} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Numéro SIRET</FormLabel>
            <Flex gap={2} align="center">
              <Input
                type="text" inputMode="numeric" maxLength={14}
                value={siret}
                onChange={(e) => { setSiret(e.target.value.replace(/\D/g, "")); if (errors.siret) setErrors(p => ({ ...p, siret: "" })); }}
                placeholder="14 chiffres" fontFamily="mono" letterSpacing="widest"
                focusBorderColor="brand.accent"
                bg={siretLookupState === "found" ? "green.50" : "white"}
                borderColor={siretLookupState === "found" ? "green.300" : "inherit"}
                flex="1"
              />
              {siretLookupState === "loading" && <Spinner size="sm" color="brand.accent" flexShrink={0} />}
            </Flex>
            <FormErrorMessage>{errors.siret}</FormErrorMessage>
          </FormControl>

          {/* Carte entreprise identifiée */}
          {siretLookupState === "found" && companyData && (
            <Box w="full" bg="green.50" border="1px solid" borderColor="green.200" borderRadius="xl" px={4} py={3}>
              <Flex align="center" gap={2} mb={6} wrap="wrap">
                <Badge colorScheme="green" fontSize="9px">✓ Entreprise identifiée</Badge>
              
              </Flex>
              {/* Dénomination commerciale en premier plan */}
              <Text fontWeight="bold" color="brand.primary" fontSize="md" lineHeight="short">
                {companyData.companyName || "Dénomination non renseignée"}
              </Text>
              <Text fontSize="xs" color="brand.secondary" fontFamily="mono" mt={0.5} letterSpacing="wider">
                {siret}
              </Text>
              <Flex gap={4} mt={2} wrap="wrap">
                {companyData.codePostal && <Text fontSize="xs" color="gray.500">📍 {companyData.codePostal}{companyData.commune ? ` · ${companyData.commune}` : ""}</Text>}
                {companyData.region && <Text fontSize="xs" color="gray.500">🗺️ {companyData.region}</Text>}
                {companyData.employeeRangeLabel && <Text fontSize="xs" color="gray.500">👥 {companyData.employeeRangeLabel}</Text>}
              </Flex>
            </Box>
          )}

          {siretLookupState === "notfound" && (
            <Box w="full" bg="orange.50" border="1px solid" borderColor="orange.200" borderRadius="xl" px={4} py={3}>
              <Text fontSize="sm" color="orange.700" fontWeight="medium">
                ⚠️ SIRET introuvable dans notre base. Vérifiez le numéro ou continuez.
              </Text>
            </Box>
          )}

          <Divider />

          {/* Identifiants utilisateur */}
          <FormControl isRequired isInvalid={!!errors.email} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Email professionnel</FormLabel>
            <Input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(p => ({ ...p, email: "" })); }} placeholder="dirigeant@entreprise.fr" focusBorderColor="brand.accent" />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.username} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Votre prénom / nom</FormLabel>
            <Input value={username} onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors(p => ({ ...p, username: "" })); }} placeholder="Jean Martin" focusBorderColor="brand.accent" />
            <FormErrorMessage>{errors.username}</FormErrorMessage>
          </FormControl>

          <FormControl isRequired isInvalid={!!errors.password} w="full">
            <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Mot de passe</FormLabel>
            <Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(p => ({ ...p, password: "" })); }} placeholder="Min. 8 car., 1 maj., 1 chiffre" focusBorderColor="brand.accent" />
            <FormErrorMessage>{errors.password}</FormErrorMessage>
          </FormControl>

          <Button type="submit" isLoading={isSubmitting} loadingText="Création en cours..." isDisabled={siretLookupState === "loading"} w="full" h="55px" bg="brand.primary" color="white" _hover={{ opacity: 0.9 }} borderRadius="xl" fontWeight="bold">
            Accéder à mon Cockpit ➔
          </Button>

          <Text fontSize="sm" color="brand.secondary" textAlign="center">
            Déjà inscrit ?{" "}
            <Link as={RouterLink} to="/login" color="brand.accent" fontWeight="bold">Se connecter</Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
}
