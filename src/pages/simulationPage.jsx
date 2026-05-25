import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import service from "../services/index.services";
import { Box, Container, Heading, Text, SimpleGrid, Button, Flex, Spinner } from "@chakra-ui/react";

export default function SimulationPage() {
  const [searchParams] = useSearchParams();
  const siret = searchParams.get("siret");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!siret) {
      setError("Aucun numéro SIRET fourni.");
      setLoading(false);
      return;
    }

    document.title = `Subventions et aides disponibles pour le SIRET ${siret} | Aides Pros`;

    const fetchSimulation = async () => {
      try {
        const response = await service.get(`/funds/simulate?siret=${siret}`);
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger la simulation. Vérifiez que le Backend est lancé.");
      } finally {
        setLoading(false);
      }
    };

    fetchSimulation();
  }, [siret]);

  if (loading) {
    return (
      <Flex minH="80vh" align="center" justify="center" bg="brand.bgLight">
        <Spinner size="xl" color="brand.accent" thickness="4px" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="80vh" direction="column" align="center" justify="center" bg="brand.bgLight" px={4}>
        <Text color="red.500" fontSize="lg" fontWeight="medium" mb={4}>⚠️ {error}</Text>
        <Button onClick={() => navigate("/")} bg="brand.primary" color="white">← Retour à l&apos;accueil</Button>
      </Flex>
    );
  }

  return (
    <Box bg="brand.bgLight" minH="90vh" py={{ base: 6, md: 12 }} px={4}>
      <Container maxW="5xl">
        
        <Button 
          variant="link" 
          color="gray.500" 
          onClick={() => navigate(-1)} 
          mb={6} 
          fontSize={{ base: "sm", md: "md" }}
          _hover={{ color: "brand.primary", textDecoration: "none" }}
        >
          ← Étape précédente
        </Button>

        <Box bg="brand.primary" color="white" p={{ base: 6, md: 10 }} borderRadius="2xl" shadow="xl" mb={10} textAlign="center">
          <Text fontSize={{ base: "11px", md: "xs" }} uppercase tracking="widest" color="brand.accent" fontWeight="bold" mb={2}>
            Estimation des subventions disponibles (SIRET : {siret})
          </Text>
          <Heading as="h2" size={{ base: "xl", md: "2xl" }} fontWeight="black" my={3} letterSpacing="tight">
            {data?.meta?.totalPotentialAmount?.toLocaleString("fr-FR")} €
          </Heading>
          <Text fontSize={{ base: "xs", md: "sm" }} color="gray.300" maxW="xl" mx="auto" lineHeight="relaxed">
            Nous avons identifié <Text as="span" color="brand.accent" fontWeight="bold">{data?.meta?.totalMatches}</Text> dispositifs financiers éligibles ou attribués à des structures similaires à la vôtre.
          </Text>
          
          <Button 
            mt={6} 
            bg="brand.accent" 
            color="white" 
            size={{ base: "md", md: "lg" }} 
            h={{ base: "50px", md: "60px" }}
            w={{ base: "full", sm: "auto" }}
            px={8}
            _hover={{ opacity: 0.9 }}
            onClick={() => navigate("/signup", { state: { pendingSiret: siret } })}
          >
            Sauvegarder mon Cockpit ➔
          </Button>
        </Box>

        <Heading as="h3" size="sm" uppercase tracking="wider" color="brand.secondary" mb={6} fontWeight="bold">
          Détails des dispositifs sélectionnés
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {data?.results?.map((fund) => (
            <Flex 
              key={fund._id} 
              bg="brand.cardBg" 
              p={6} 
              borderRadius="xl" 
              shadow="sm" 
              border="1px solid" 
              borderColor="brand.border"
              direction="column"
              justify="space-between"
              transition="transform 0.2s"
              _hover={{ transform: "translateY(-2px)", shadow: "md" }}
            >
              <Box>
                <Flex justify="space-between" align="start" gap={4} mb={3}>
                  <Heading as="h4" size="sm" color="brand.primary" noOfLines={2} lineHeight="base" fontWeight="bold">
                    {fund.title}
                  </Heading>
                  <Box bg="#10B981" color="white" px={2} py={1} borderRadius="md" fontSize="10px" fontWeight="bold">
                    {fund.score}% Match
                  </Box>
                </Flex>

                <Text fontSize="xs" color="brand.secondary" mb={4} noOfLines={3} lineHeight="relaxed">
                  {fund.description}
                </Text>
              </Box>

              <Flex borderTop="1px solid" borderColor="brand.border" pt={4} align="center" justify="space-between">
                <Box>
                  <Text fontSize="9px" uppercase tracking="wider" color="gray.400" fontWeight="bold">Plafond Max</Text>
                  <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold" color="brand.primary">
                    {fund.maxAmount > 100 ? `${fund.maxAmount.toLocaleString("fr-FR")} €` : `${fund.maxAmount} €/h`}
                  </Text>
                </Box>

                {fund.paymentDelayInDays ? (
                  <Box textAlign="right">
                    <Text fontSize="9px" uppercase tracking="wider" color="gray.400" fontWeight="bold">Délai d&apos;obtention</Text>
                    <Text fontSize="xs" fontWeight="semibold" color="brand.secondary">
                      ⏱️ Env. {fund.paymentDelayInDays} jours
                    </Text>
                  </Box>
                ) : (
                  <Box bg="#F1F5F9" color="#64748B" fontSize="9px" borderRadius="sm" px={2} py={0.5} fontWeight="medium">
                    Analyse délai en cours
                  </Box>
                )}
              </Flex>
            </Flex>
          ))}
        </SimpleGrid>

      </Container>
    </Box>
  );
}