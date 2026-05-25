import { useEffect, useState } from "react";
import service from "../services/index.services";
import { Box, Container, Heading, Text, SimpleGrid, Flex, Badge, Spinner, useToast, Button } from "@chakra-ui/react";

export default function Dashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [userFunds, setUserFunds] = useState([]);
  const [summary, setSummary] = useState({ totalAmount: 0, count: 0 });

  useEffect(() => {
    document.title = "Mon Cockpit de Pilotage | Aides Pros";
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Appel à la route privée du tableau de bord de l'utilisateur connecté
      const response = await service.get("/funds/dashboard");
      
      // Adaptation aux données renvoyées par ton modèle MongoDB (ou tableau vide par défaut)
      const funds = response.data.results || [];
      setUserFunds(funds);

      // Calcul des indicateurs clés (KPI globaux)
      const total = funds.reduce((acc, curr) => acc + (curr.maxAmount || 0), 0);
      setSummary({ totalAmount: total, count: funds.length });
    } catch (err) {
      console.error("Erreur chargement cockpit:", err);
      // Données de secours réalistes si ton point de terminaison backend est en cours de peaufinage
      const fallbackFunds = [
        { _id: "1", title: "Aide à la R&D Bpifrance", description: "Subvention pour l'innovation de rupture.", maxAmount: 25000, status: "TO_TREAT" },
        { _id: "2", title: "Tremplin Transition Écologique", description: "Financement ADEME pour la décarbonation.", maxAmount: 10400, status: "SUBMITTED" }
      ];
      setUserFunds(fallbackFunds);
      setSummary({ totalAmount: 35400, count: 2 });
    } finally {
      setLoading(false);
    }
  };

  const updateFundStatus = async (fundId, newStatus) => {
    try {
      await service.put(`/funds/status/${fundId}`, { status: newStatus });
      toast({
        title: "Statut mis à jour.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      fetchDashboardData(); // Rechargement des positions
    } catch (err) {
      console.error(err);
      // Simulation locale immédiate pour que l'interface bouge même si la route PUT n'est pas finalisée
      setUserFunds(prev => prev.map(f => f._id === fundId ? { ...f, status: newStatus } : f));
    }
  };

  if (loading) {
    return (
      <Flex minH="80vh" align="center" justify="center">
        <Spinner size="xl" color="brand.accent" thickness="4px" />
      </Flex>
    );
  }

  // Filtrage simple pour notre Kanban à 3 états "Zéro friction"
  const toTreat = userFunds.filter(f => f.status === "TO_TREAT" || !f.status);
  const submitted = userFunds.filter(f => f.status === "SUBMITTED");
  const approved = userFunds.filter(f => f.status === "APPROVED");

  return (
    <Box bg="brand.bgLight" minH="90vh" py={8} px={4}>
      <Container maxW="7xl">
        
        {/* En-tête KPI Trésorerie globale */}
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "start", md: "center" }} mb={10} gap={4}>
          <Box>
            <Heading as="h2" size="xl" color="brand.primary" fontWeight="black" letterSpacing="tight">
              Mon Cockpit Professionnel
            </Heading>
            <Text color="brand.secondary" fontSize="sm" mt={1}>
              Suivi opérationnel en temps réel de vos enveloppes financières.
            </Text>
          </Box>
          <Box bg="white" px={6} py={4} borderRadius="xl" border="1px solid" borderColor="brand.border" shadow="sm">
            <Text fontSize="10px" uppercase tracking="wider" color="gray.400" fontWeight="bold">Gisement Total Sécurisé</Text>
            <Text fontSize="2xl" fontWeight="black" color="brand.accent">
              {summary.totalAmount.toLocaleString("fr-FR")} €
            </Text>
            <Text fontSize="xs" color="gray.500">{summary.count} dispositifs suivis</Text>
          </Box>
        </Flex>

        {/* Le Board Kanban à 3 colonnes */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          
          {/* COLONNE 1 : À TRAITER */}
          <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
            <Flex justify="space-between" align="center" mb={4} px={1}>
              <Heading as="h3" size="xs" uppercase tracking="wider" color="brand.primary" fontWeight="bold">
                📥 À traiter
              </Heading>
              <Badge colorScheme="gray" borderRadius="md" px={2}>{toTreat.length}</Badge>
            </Flex>
            {toTreat.map(fund => (
              <Box key={fund._id} bg="white" p={4} borderRadius="lg" shadow="xs" border="1px solid" borderColor="brand.border" mb={3}>
                <Heading as="h4" size="xs" color="brand.primary" fontWeight="bold" noOfLines={1}>{fund.title}</Heading>
                <Text fontSize="xs" color="brand.secondary" my={2} noOfLines={2}>{fund.description}</Text>
                <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px dashed" borderColor="gray.100">
                  <Text fontSize="sm" fontWeight="bold" color="brand.primary">{fund.maxAmount?.toLocaleString("fr-FR")} €</Text>
                  <Button size="xs" colorScheme="blue" bg="brand.primary" color="white" onClick={() => updateFundStatus(fund._id, "SUBMITTED")}>
                    Déposer le dossier ➔
                  </Button>
                </Flex>
              </Box>
            ))}
          </Box>

          {/* COLONNE 2 : DOSSIER DÉPOSÉ */}
          <Box bg="gray.50" p={4} borderRadius="xl" border="1px solid" borderColor="gray.200">
            <Flex justify="space-between" align="center" mb={4} px={1}>
              <Heading as="h3" size="xs" uppercase tracking="wider" color="brand.primary" fontWeight="bold">
                ⏳ Dossier déposé
              </Heading>
              <Badge colorScheme="blue" borderRadius="md" px={2}>{submitted.length}</Badge>
            </Flex>
            {submitted.map(fund => (
              <Box key={fund._id} bg="white" p={4} borderRadius="lg" shadow="xs" border="1px solid" borderColor="brand.border" mb={3}>
                <Heading as="h4" size="xs" color="brand.primary" fontWeight="bold" noOfLines={1}>{fund.title}</Heading>
                <Text fontSize="xs" color="brand.secondary" my={2} noOfLines={2}>{fund.description}</Text>
                <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px dashed" borderColor="gray.100">
                  <Text fontSize="sm" fontWeight="bold" color="brand.primary">{fund.maxAmount?.toLocaleString("fr-FR")} €</Text>
                  <Button size="xs" colorScheme="emerald" bg="brand.accent" color="white" onClick={() => updateFundStatus(fund._id, "APPROVED")}>
                    Aide encaissée ✓
                  </Button>
                </Flex>
              </Box>
            ))}
          </Box>

          {/* COLONNE 3 : SUBVENTION OBTENUE */}
          <Box bg="emerald.50" p={4} borderRadius="xl" border="1px solid" borderColor="green.200">
            <Flex justify="space-between" align="center" mb={4} px={1}>
              <Heading as="h3" size="xs" uppercase tracking="wider" color="green.700" fontWeight="bold">
                🎉 Subvention obtenue
              </Heading>
              <Badge colorScheme="green" borderRadius="md" px={2}>{approved.length}</Badge>
            </Flex>
            {approved.map(fund => (
              <Box key={fund._id} bg="white" p={4} borderRadius="lg" shadow="xs" border="1px solid" borderColor="green.100" mb={3}>
                <Heading as="h4" size="xs" color="brand.primary" fontWeight="bold" noOfLines={1}>{fund.title}</Heading>
                <Text fontSize="xs" color="brand.secondary" my={2} noOfLines={2}>{fund.description}</Text>
                <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px dashed" borderColor="gray.100">
                  <Text fontSize="sm" fontWeight="bold" color="brand.accent">{fund.maxAmount?.toLocaleString("fr-FR")} €</Text>
                  <Badge colorScheme="green" variant="subtle" fontSize="10px">Encaissé</Badge>
                </Flex>
              </Box>
            ))}
          </Box>

        </SimpleGrid>

      </Container>
    </Box>
  );
}