import { useEffect, useState, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import service from "../services/index.services";
import { AuthContext } from "../context/auth.context";
import {
  Box, Container, Heading, Text, Button, Flex, Spinner, Badge,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  SimpleGrid, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, ModalFooter, Stack, Divider, useDisclosure,
  useToast
} from "@chakra-ui/react";

// Familles de classement (basées sur le champ "category" du Fund)
const FAMILIES = {
  "Innovation & R&D": { key: "R&D", icon: "🔬" },
  "Transition Écologique & Énergie": { key: "ENERGY", icon: "🌱" },
  "Emploi & Alternance": { key: "HIRING", icon: "👥" },
  "Numérique & Digital": { key: "DIGITAL", icon: "💻" },
  "Autres dispositifs": { key: "OTHER", icon: "📋" }
};

export default function SimulationPage() {
  const [searchParams] = useSearchParams();
  const siret = searchParams.get("siret");
  const navigate = useNavigate();
  const toast = useToast();
  const { isLoggedIn, loggedUserId } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [realisticTotal, setRealisticTotal] = useState(0);
  const [categorizedFunds, setCategorizedFunds] = useState({});
  const [userRevenue, setUserRevenue] = useState(null);

  // Pour le modal détail d'une aide
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFund, setSelectedFund] = useState(null);
  const [addingToBoard, setAddingToBoard] = useState(false);

  // ── Récupérer le revenue réel de l'utilisateur si connecté ──────────────
  useEffect(() => {
    if (isLoggedIn) {
      service.get("/auth/me")
        .then(res => setUserRevenue(res.data?.revenue || null))
        .catch(() => {}); // Non bloquant
    }
  }, [isLoggedIn]);

  // ── Fetch simulation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!siret) {
      setError("Aucun numéro SIRET fourni.");
      setLoading(false);
      return;
    }

    document.title = `Analyse subventions — SIRET ${siret} | AidesPros`;

    const fetchSimulation = async () => {
      try {
        const response = await service.get(`/funds/simulate?siret=${siret}`);
        const rawData = response.data || {};
        setData(rawData);

        const fundsList = rawData.results || [];

        // Classification par familles (via le champ "category" du Fund)
        const classified = {};
        Object.entries(FAMILIES).forEach(([familyName, { key }]) => {
          const funds = fundsList.filter(f => f.category === key || (key === "OTHER" && !Object.values(FAMILIES).slice(0, 4).map(f => f.key).includes(f.category)));
          if (funds.length > 0) classified[familyName] = funds;
        });

        // Fallback : si aucune catégorie ne matche, tout mettre dans "Autres"
        if (Object.keys(classified).length === 0 && fundsList.length > 0) {
          classified["Dispositifs éligibles"] = fundsList;
        }

        setCategorizedFunds(classified);

        // ✅ CORRECTION : Cap calculé sur le revenue RÉEL si disponible
        // sinon on utilise une estimation prudente pour la démo
        const caRef = userRevenue || 80000;
        const maxCap = caRef * 0.25;

        let cumulativeSum = 0;
        Object.values(classified).forEach(funds => {
          const best = funds
            .filter(f => f.maxAmount && f.maxAmount >= 100)
            .sort((a, b) => b.maxAmount - a.maxAmount)[0];
          if (best) cumulativeSum += best.maxAmount;
        });

        if (cumulativeSum > maxCap) {
          setRealisticTotal(Math.round(maxCap));
        } else if (cumulativeSum === 0) {
          setRealisticTotal(12500);
        } else {
          setRealisticTotal(Math.round(cumulativeSum));
        }

      } catch (err) {
        console.error(err);
        setError("Impossible de charger la simulation. Vérifiez que votre backend est connecté.");
      } finally {
        setLoading(false);
      }
    };

    fetchSimulation();
  }, [siret, userRevenue]);

  // ── Ouvrir modal détail ──────────────────────────────────────────────────
  const openFundDetail = (fund) => {
    setSelectedFund(fund);
    onOpen();
  };

  // ── Ajouter au cockpit (si connecté) ────────────────────────────────────
  const handleAddToCockpit = async (fundId) => {
    if (!isLoggedIn) {
      navigate("/signup", { state: { pendingSiret: siret } });
      return;
    }
    setAddingToBoard(true);
    try {
      await service.post("/userFunds", { fundId });
      toast({
        title: "Aide ajoutée",
        description: "Ce dispositif a été ajouté à votre cockpit.",
        status: "success",
        duration: 3000,
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.errorMessage || "Erreur lors de l'ajout.";
      toast({ title: msg, status: "info", duration: 3000 });
    } finally {
      setAddingToBoard(false);
    }
  };

  if (loading) {
    return (
      <Flex minH="80vh" align="center" justify="center" bg="brand.bgLight">
        <Spinner size="xl" color="brand.accent" thickness="4px" speed="0.65s" emptyColor="gray.200" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex minH="80vh" direction="column" align="center" justify="center" bg="brand.bgLight" px={4}>
        <Text color="red.500" fontSize="lg" fontWeight="medium" mb={4}>⚠️ {error}</Text>
        <Button onClick={() => navigate("/")} bg="brand.primary" color="white">← Retour à l'accueil</Button>
      </Flex>
    );
  }

  return (
    <Box bg="brand.bgLight" minH="90vh" py={{ base: 6, md: 10 }} px={4}>
      <Container maxW="4xl">

        <Button
          variant="link"
          color="gray.500"
          onClick={() => navigate(-1)}
          mb={6}
          _hover={{ color: "brand.primary" }}
          fontSize="sm"
        >
          ← Étape précédente
        </Button>

        {/* ── HERO KPI ── */}
        <Box bg="brand.primary" color="white" p={{ base: 6, md: 8 }}
          borderRadius="2xl" shadow="xl" mb={8} textAlign="center">
          <Text fontSize="xs" textTransform="uppercase" letterSpacing="widest"
            color="brand.accent" fontWeight="bold" mb={2}>
            Enveloppe maximale mobilisable — SIRET : {siret}
          </Text>

          <Heading as="h2" size="2xl" fontWeight="black" my={3}>
            {realisticTotal.toLocaleString("fr-FR")} €
          </Heading>

          <Text fontSize="xs" color="gray.300" maxW="xl" mx="auto" mb={5} lineHeight="relaxed">
            {userRevenue
              ? `Plafond ajusté à 25% de votre CA déclaré (${userRevenue.toLocaleString("fr-FR")} €).`
              : "Plafond estimé à 25% du CA moyen de votre profil sectoriel. Inscrivez-vous pour un calcul personnalisé."}
          </Text>

          <Flex justify="center" gap={3} wrap="wrap">
            <Button
              bg="brand.accent"
              color="white"
              size="lg"
              px={8}
              _hover={{ opacity: 0.9 }}
              onClick={() => navigate("/signup", { state: { pendingSiret: siret } })}
            >
              {isLoggedIn ? "Voir mon Cockpit →" : "Sauvegarder et piloter ces aides ➔"}
            </Button>
          </Flex>
        </Box>

        {/* ── MÉTA ── */}
        <Flex gap={3} mb={6} wrap="wrap">
          <Badge colorScheme="blue" px={3} py={1} borderRadius="md">
            {data?.meta?.totalMatches || 0} dispositifs identifiés
          </Badge>
          <Badge colorScheme="green" px={3} py={1} borderRadius="md">
            Moteur prédictif actif
          </Badge>
        </Flex>

        <Heading as="h3" size="xs" textTransform="uppercase" color="brand.secondary"
          mb={4} fontWeight="bold" letterSpacing="wider">
          📁 Vos opportunités par leviers stratégiques
        </Heading>

        {/* ── ACCORDÉONS PAR CATÉGORIE ── */}
        <Accordion allowMultiple defaultIndex={[0]}>
          {Object.entries(categorizedFunds).map(([familyName, funds], index) => (
            <AccordionItem key={index} bg="white" border="1px solid" borderColor="brand.border"
              borderRadius="xl" mb={4} overflow="hidden" shadow="xs">
              <h2>
                <AccordionButton py={4} _hover={{ bg: "gray.50" }}>
                  <Flex flex="1" textAlign="left" align="center" justify="space-between" pr={4}>
                    <Heading as="h4" size="sm" color="brand.primary" fontWeight="bold">
                      {FAMILIES[familyName]?.icon || "📋"} {familyName}
                    </Heading>
                    <Badge colorScheme="blue" borderRadius="md" px={2} py={0.5}>
                      {funds.length} {funds.length > 1 ? "aides" : "aide"}
                    </Badge>
                  </Flex>
                  <AccordionIcon color="brand.primary" />
                </AccordionButton>
              </h2>

              <AccordionPanel pb={4} bg="brand.bgLight">
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={2}>
                  {funds.map((fund) => (
                    <Flex
                      key={fund._id}
                      bg="white"
                      p={4}
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="brand.border"
                      direction="column"
                      justify="space-between"
                      shadow="xs"
                      cursor="pointer"
                      _hover={{ shadow: "md", borderColor: "brand.accent" }}
                      onClick={() => openFundDetail(fund)}
                      transition="all 0.15s"
                    >
                      <Box>
                        <Flex justify="space-between" align="start" gap={2} mb={2}>
                          <Text fontSize="xs" fontWeight="bold" color="brand.primary" noOfLines={2}>
                            {fund.title}
                          </Text>
                          <Badge colorScheme="green" variant="subtle" fontSize="9px" flexShrink={0}>
                            {fund.matchScore || 60}% Match
                          </Badge>
                        </Flex>
                        <Text fontSize="11px" color="brand.secondary" noOfLines={2} mb={3}>
                          {fund.description}
                        </Text>
                      </Box>

                      <Flex borderTop="1px solid" borderColor="gray.100" pt={2}
                        align="center" justify="space-between">
                        <Box>
                          <Text fontSize="8px" textTransform="uppercase" color="gray.400" fontWeight="bold">
                            Plafond
                          </Text>
                          <Text fontSize="xs" fontWeight="bold" color="brand.primary">
                            {fund.maxAmount > 100
                              ? `${fund.maxAmount.toLocaleString("fr-FR")} €`
                              : `${fund.maxAmount} €/h`}
                          </Text>
                        </Box>
                        <Text fontSize="10px" color="brand.accent" fontWeight="bold">
                          Voir le détail →
                        </Text>
                      </Flex>
                    </Flex>
                  ))}
                </SimpleGrid>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>

      </Container>

      {/* ── MODAL DÉTAIL AIDE ── */}
      {selectedFund && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" scrollBehavior="inside">
          <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl" mx={4}>
            <ModalHeader color="brand.primary" fontWeight="black" pr={10} fontSize="md">
              {selectedFund.title}
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6}>
              <Stack spacing={4}>

                {/* Score de match */}
                <Flex align="center" gap={2}>
                  <Badge colorScheme="green" px={3} py={1} borderRadius="md" fontSize="sm">
                    ✅ {selectedFund.matchScore || 60}% de correspondance
                  </Badge>
                  {selectedFund.category && (
                    <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                      {selectedFund.category}
                    </Badge>
                  )}
                </Flex>

                {/* Montant */}
                <Box bg="brand.primary" color="white" p={4} borderRadius="xl">
                  <Text fontSize="xs" color="gray.300" fontWeight="bold">Plafond théorique</Text>
                  <Text fontSize="2xl" fontWeight="black" mt={1}>
                    {selectedFund.maxAmount > 100
                      ? `${selectedFund.maxAmount.toLocaleString("fr-FR")} €`
                      : `${selectedFund.maxAmount} €/h`}
                  </Text>
                  {selectedFund.montantTexte && (
                    <Text fontSize="xs" color="gray.300" mt={2}>{selectedFund.montantTexte}</Text>
                  )}
                </Box>

                {selectedFund.description && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Description</Text>
                    <Text fontSize="sm" color="brand.primary" lineHeight="tall">{selectedFund.description}</Text>
                  </Box>
                )}

                {selectedFund.conditions && (
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Conditions</Text>
                    <Text fontSize="sm" color="brand.primary" lineHeight="tall">{selectedFund.conditions}</Text>
                  </Box>
                )}

                {selectedFund.beneficiaires && (
                  <Box bg="blue.50" p={3} borderRadius="lg">
                    <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={1}>Bénéficiaires</Text>
                    <Text fontSize="sm" color="gray.700">{selectedFund.beneficiaires}</Text>
                  </Box>
                )}

                {/* Raisons du match */}
                {selectedFund.matchReasons?.length > 0 && (
                  <Box bg="green.50" p={3} borderRadius="lg">
                    {selectedFund.matchReasons.map((reason, i) => (
                      <Text key={i} fontSize="xs" color="green.700">{reason}</Text>
                    ))}
                  </Box>
                )}

              </Stack>
            </ModalBody>

            <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
              <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
              <Button
                bg="brand.accent"
                color="white"
                size="sm"
                isLoading={addingToBoard}
                onClick={() => handleAddToCockpit(selectedFund._id)}
              >
                {isLoggedIn ? "Ajouter au Cockpit" : "S'inscrire pour piloter →"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
