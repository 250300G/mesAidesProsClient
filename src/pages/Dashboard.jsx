import { useState, useEffect } from "react";
import service from "../services/index.services";
import {
  Box, Container, Heading, Text, Input, Select, Table, Tbody, Tr, Th, Thead, Td,
  Button, Flex, useDisclosure, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Stack, Spinner, useToast
} from "@chakra-ui/react";

export default function DashboardPage() {
  const [myFunds, setMyFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // 1. READ : Chargement des aides liées à l'entreprise
  const fetchMyFunds = async () => {
    try {
      const response = await service.get("/userFunds/my-cockpit"); // Ajusté selon ta route active
      setMyFunds(response.data || []);
      setFilteredFunds(response.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des aides :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFunds();
  }, []);

  // 2. FILTRAGE EN TEMPS RÉEL (Recherche & Catégories)
  useEffect(() => {
    let result = myFunds;

    if (searchQuery) {
      result = result.filter((item) =>
        item.fundId?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter((item) => item.fundId?.category === selectedCategory);
    }

    setFilteredFunds(result);
  }, [searchQuery, selectedCategory, myFunds]);

  // 3. UPDATE : Modifier l'avancement d'un dossier
  const handleStatusChange = async (userFundId, newStatus) => {
    try {
      await service.put(`/userFunds/${userFundId}`, { status: newStatus });
      
      toast({
        title: "Statut mis à jour",
        status: "success",
        duration: 2000,
      });

      // Rafraîchissement local des données
      setMyFunds((prev) =>
        prev.map((item) => (item._id === userFundId ? { ...item, status: newStatus } : item))
      );
      
      if (selectedFund && selectedFund._id === userFundId) {
        setSelectedFund((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. DELETE : Supprimer une aide du suivi
  const handleDeleteFund = async (userFundId) => {
    try {
      await service.delete(`/userFunds/${userFundId}`);
      toast({
        title: "Aide retirée",
        description: "L'aide a été retirée de votre cockpit.",
        status: "info",
        duration: 3000,
      });
      setMyFunds((prev) => prev.filter((item) => item._id !== userFundId));
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const openDetails = (fundRecord) => {
    setSelectedFund(fundRecord);
    onOpen();
  };

  if (loading) {
    return (
      <Flex minH="70vh" justify="center" align="center">
        <Spinner size="xl" color="brand.primary" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box minH="90vh" bg="brand.bgLight" py={8}>
      <Container maxW="container.lg">
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="xl" color="brand.primary" fontWeight="black">Votre Cockpit Financier</Heading>
            <Text color="brand.secondary" mt={1}>Gestion et avancement de vos enveloppes d'aides publiques.</Text>
          </Box>
        </Flex>

        {/* BARRE DE FILTRES COMPACTE */}
        <Flex gap={4} mb={6} bg="white" p={4} borderRadius="xl" shadow="sm">
          <Input
            placeholder="Rechercher un dispositif..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            focusBorderColor="brand.accent"
          />
          <Select
            placeholder="Toutes les catégories"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            maxW="250px"
          >
            <option value="R&D">Innovation / R&D</option>
            <option value="HIRING">Recrutement</option>
            <option value="ENERGY">Transition Écologique</option>
          </Select>
        </Flex>

        {/* TABLEAU DES ENVELOPPES */}
        <Box bg="white" borderRadius="xl" shadow="md" overflow="hidden" border="1px solid" borderColor="brand.border">
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th color="brand.primary">Dispositif</Th>
                <Th color="brand.primary">Montant Estimé</Th>
                <Th color="brand.primary">Statut du Dossier</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredFunds.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={8} color="brand.secondary">
                    Aucun dispositif en cours de suivi.
                  </Td>
                </Tr>
              ) : (
                filteredFunds.map((item) => (
                  <Tr key={item._id} _hover={{ bg: "gray.50" }}>
                    <Td fontWeight="semibold" color="brand.primary">{item.fundId?.title || "Dispositif sans nom"}</Td>
                    <Td fontWeight="bold" color="brand.accent">
                      {item.fundId?.maxAmount ? `${item.fundId.maxAmount.toLocaleString("fr-FR")} €` : "Sur devis"}
                    </Td>
                    <Td>
                      <Select
                        size="sm"
                        w="200px"
                        borderRadius="md"
                        value={item.status || "À traiter"}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                      >
                        <option value="À traiter">📁 À traiter (Gisement)</option>
                        <option value="En cours">⏳ Dossier déposé</option>
                        <option value="Validée">💰 Subvention obtenue</option>
                      </Select>
                    </Td>
                    <Td textAlign="right">
                      <Button size="sm" bg="brand.primary" color="white" onClick={() => openDetails(item)}>
                        Détails
                      </Button>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* MODAL DE DÉTAILS DU DISPOSITIF */}
        {selectedFund && (
          <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="2xl">
              <ModalHeader color="brand.primary" fontWeight="bold">{selectedFund.fundId?.title}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Stack spacing={4}>
                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase">Description</Text>
                    <Text fontSize="sm" color="brand.primary" mt={1}>{selectedFund.fundId?.description}</Text>
                  </Box>
                  <Flex justify="space-between" bg="gray.50" p={3} borderRadius="xl">
                    <Box>
                      <Text fontSize="xs" color="gray.400">Plafond Enveloppe</Text>
                      <Text fontWeight="bold" color="brand.accent">
                        {selectedFund.fundId?.maxAmount ? `${selectedFund.fundId.maxAmount.toLocaleString("fr-FR")} €` : "Sur devis"}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="gray.400">Délai moyen</Text>
                      <Text fontWeight="bold" color="brand.primary">⏱️ {selectedFund.fundId?.paymentDelayInDays || "60"} jours</Text>
                    </Box>
                  </Flex>
                </Stack>
              </ModalBody>
              <ModalFooter borderTop="1px solid" borderColor="gray.100" gap={2}>
                <Button colorScheme="red" variant="ghost" size="sm" onClick={() => handleDeleteFund(selectedFund._id)}>
                  Retirer du Cockpit
                </Button>
                <Button bg="brand.primary" color="white" size="sm" onClick={onClose}>
                  Fermer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
      </Container>
    </Box>
  );
}