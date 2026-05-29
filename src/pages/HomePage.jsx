// pages/HomePage.jsx
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Button,
  VStack,
  FormControl,
  SimpleGrid,
  Flex,
} from "@chakra-ui/react";

// Catégories affichées sur la homepage — liens vers /funds?category=
const CATEGORY_CARDS = [
  {
    key: "R&D",
    label: "Innovation & R&D",
    icon: "🔬",
    desc: "CIR, BPI, aides à la recherche",
    color: "purple.50",
    border: "purple.100",
  },
  {
    key: "ENERGY",
    label: "Transition écologique",
    icon: "🌱",
    desc: "Rénovation, énergie, décarbonation",
    color: "green.50",
    border: "green.100",
  },
  {
    key: "HIRING",
    label: "Emploi & Alternance",
    icon: "👥",
    desc: "Embauche, formation, apprentissage",
    color: "blue.50",
    border: "blue.100",
  },
  {
    key: "DIGITAL",
    label: "Numérique & Digital",
    icon: "💻",
    desc: "Transformation digitale, cybersécurité",
    color: "cyan.50",
    border: "cyan.100",
  },
  {
    key: "OTHER",
    label: "Trésorerie & Autres",
    icon: "📋",
    desc: "Prêts, garanties, dispositifs divers",
    color: "orange.50",
    border: "orange.100",
  },
];

export default function HomePage() {
  const [siret, setSiret] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanSiret = siret.replace(/\s/g, "");
    if (!/^\d{14}$/.test(cleanSiret)) {
      setError("Le numéro SIRET doit comporter exactement 14 chiffres.");
      return;
    }
    setError("");
    navigate(`/simulation?siret=${cleanSiret}`);
  };

  return (
    <Box bg="brand.bgLight" minH="90vh">
      {/* ══════════════════════ HERO ══════════════════════ */}
      <Box bg="brand.bgLight" py={{ base: 12, md: 20 }} px={4}>
        <Container maxW="xl" textAlign="center">
          <VStack spacing={5}>
                       <Heading
              as="h1"
              size={{ base: "xl", md: "3xl" }}
              color="brand.primary"
              fontWeight="black"
              letterSpacing="tight"
              lineHeight="1.15"
              mt={4}
              mb={6}
              bg="gray.100" 
              px={4} 
              py={2}  
              borderRadius="md"
            >
              Identifiez vos subventions{" "}
              <Text as="span" color="brand.accent">
                en 3 secondes
              </Text>
            </Heading>

            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="brand.secondary"
              maxW="lg"
            >
              Entrez le numéro SIRET de votre société & analysez instantanément
              votre éligibilité
            </Text>

            <Box as="form" onSubmit={handleSubmit} w="full" mt={2} maxW="md">
              <FormControl isInvalid={!!error}>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  value={siret}
                  onChange={(e) => {
                    setSiret(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  placeholder="Ex : 123 456 789 00014"
                  size="lg"
                  h="60px"
                  bg="white"
                  textAlign="center"
                  fontSize="xl"
                  fontFamily="mono"
                  letterSpacing="widest"
                  focusBorderColor="brand.accent"
                  borderColor="brand.border"
                  borderRadius="xl"
                  shadow="sm"
                />
                {error && (
                  <Text
                    color="red.500"
                    fontSize="sm"
                    mt={2}
                    textAlign="center"
                    fontWeight="medium"
                  >
                    ⚠️ {error}
                  </Text>
                )}
              </FormControl>

              <Button
                type="submit"
                w="full"
                h="30px"
                mt={3}
                bg="brand.accent"
                color="white"
                size="lg"
                borderRadius="xl"
                _hover={{ opacity: 0.9 }}
                shadow="md"
                fontSize="md"
                fontWeight="bold"
              >
                Analyser mon éligibilité ➔
              </Button>
            </Box>

            <Flex gap={4} wrap="wrap" justify="center" mt={1}>
              <Text fontSize="xs" color="gray.400">
                ✓ Gratuit et sans inscription
              </Text>
              <Text fontSize="xs" color="gray.400">
                ✓ Données INSEE en temps réel
              </Text>
              <Text fontSize="xs" color="gray.400">
                ✓ Résultats instantanés
              </Text>
            </Flex>
          </VStack>
        </Container>
      </Box>

      {/* ══════════════════════ CATÉGORIES ══════════════════════ */}
      <Box bg="white" py={{ base: 10, md: 30 }} px={4}>
        <Container maxW="5xl">
          <Flex
            align="center"
            justify="space-between"
            mb={6}
            wrap="wrap"
            gap={2}
          >
            <Box flex="1" textAlign="center">
              <Heading
                size="md"
                color="brand.primary"
                fontWeight="black"
                lineHeight="1.2"
              >
                Explorer par catégorie
              </Heading>

              <Text
                fontSize="sm"
                color="brand.secondary"
                mt={1}
                lineHeight="1.3"
              >
                Naviguez librement dans le catalogue des dispositifs publics.
              </Text>
            </Box>

            <Button
              as={RouterLink}
              to="/funds"
              size="sm"
              variant="outline"
              minW="fit-content"
              borderColor="brand.border"
              color="brand.accent"
              borderRadius="xl"
              _hover={{ bg: "gray.50", color: "brand.primary" }}
            >
              Voir tout le catalogue →
            </Button>
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={3}>
            {CATEGORY_CARDS.map((cat) => (
              <Box
                key={cat.key}
                as={RouterLink}
                to={`/funds?category=${encodeURIComponent(cat.key)}`}
                bg={cat.color}
                border="1px solid"
                borderColor={cat.border}
                borderRadius="xl"
                p={4}
                cursor="pointer"
                _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                transition="all 0.15s"
                display="block"
                textDecoration="none"
              >
                <Text fontSize="2xl" mb={2}>
                  {cat.icon}
                </Text>

                <Text
                  fontWeight="bold"
                  color="brand.primary"
                  fontSize="sm"
                  mb={1}
                >
                  {cat.label}
                </Text>

                <Text fontSize="11px" color="gray.500" lineHeight="1.4">
                  {cat.desc}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
      {/* ══════════════════════ STATS CONFIANCE ══════════════════════ */}
      <Box bg="brand.bgLight" py={{ base: 8, md: 12 }} px={4}>
        <Container maxW="3xl">
          <SimpleGrid
            columns={{ base: 2, md: 4 }}
            spacing={6}
            textAlign="center"
          >
            {[
              { val: "500+", label: "Dispositifs répertoriés" },
              { val: "14", label: "Catégories d'aides" },
              { val: "100%", label: "Données publiques" },
              { val: "0 €", label: "Gratuit sans engagement" },
            ].map(({ val, label }) => (
              <Box key={label}>
                <Text fontSize="2xl" fontWeight="black" color="brand.primary">
                  {val}
                </Text>
                <Text fontSize="xs" color="brand.secondary" mt={0.5}>
                  {label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ══════════════════════ CTA BAS DE PAGE ══════════════════════ */}
      <Box
        bg="brand.primary"
        py={{ base: 10, md: 14 }}
        px={4}
        textAlign="center"
      >
        <Container maxW="lg">
          <Heading size="lg" color="white" fontWeight="black" mb={3}>
            Prêt à accéder à votre cockpit financier ?
          </Heading>
          <Text fontSize="sm" color="gray.300" mb={6}>
            Inscrivez-vous gratuitement pour piloter vos dossiers, suivre les
            échéances et recevoir des recommandations personnalisées.
          </Text>
          <Flex justify="center" gap={3} wrap="wrap">
            <Button
              as={RouterLink}
              to="/signup"
              bg="brand.accent"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              _hover={{ opacity: 0.9 }}
            >
              Créer mon espace gratuit ➔
            </Button>
            <Button
              as={RouterLink}
              to="/funds"
              variant="outline"
              borderColor="whiteAlpha.400"
              color="white"
              size="lg"
              px={8}
              borderRadius="xl"
              _hover={{ bg: "whiteAlpha.100" }}
            >
              Explorer les aides
            </Button>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
