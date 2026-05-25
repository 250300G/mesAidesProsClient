import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Container, Heading, Text, Button, VStack } from "@chakra-ui/react";

export default function ProjectSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const siret = location.state?.siret || "";

  const [investmentType, setInvestmentType] = useState("ALL");
  const [amountNeeded, setAmountNeeded] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    navigate(`/simulation?siret=${siret}`, {
      state: { investmentType, amountNeeded }
    });
  };

  const selectStyle = {
    width: "100%",
    height: "45px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "0.5rem",
    padding: "0 1rem",
    fontSize: "0.95rem",
    color: "#0F172A",
    outline: "none"
  };

  const inputStyle = {
    width: "100%",
    height: "45px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "0.5rem",
    padding: "0 1rem",
    fontSize: "0.95rem",
    color: "#0F172A",
    outline: "none"
  };

  return (
    <Box py={{ base: 8, md: 16 }} px={4}>
      <Container maxW="md" bg="brand.cardBg" p={{ base: 6, md: 8 }} borderRadius="2xl" border="1px solid" borderColor="brand.border" shadow="sm">
        <Button variant="link" color="brand.secondary" fontSize="sm" onClick={() => navigate("/")} mb={6}>
          ← Modifier le SIRET ({siret})
        </Button>

        <VStack as="form" onSubmit={handleNext} spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="lg" color="brand.primary" fontWeight="bold">Configuration du projet</Heading>
            <Text fontSize="sm" color="brand.secondary" mt={1}>Ajustez vos critères pour affiner l&apos;analyse prédictive.</Text>
          </Box>

          <Box>
            <Text as="label" display="block" fontSize="sm" fontWeight="semibold" mb={2} color="brand.primary">
              Type de besoin de financement
            </Text>
            <select value={investmentType} onChange={(e) => setInvestmentType(e.target.value)} style={selectStyle}>
              <option value="ALL">Tous types d&apos;aides</option>
              <option value="R&D">Recherche & Développement (Innovation)</option>
              <option value="HIRING">Recrutement & Emploi</option>
              <option value="ENERGY">Transition Écologique & Énergie</option>
            </select>
          </Box>

          <Box>
            <Text as="label" display="block" fontSize="sm" fontWeight="semibold" mb={2} color="brand.primary">
              Budget global estimé (€)
            </Text>
            <input
              type="number"
              min="0"
              placeholder="Ex: 50000"
              value={amountNeeded}
              onChange={(e) => setAmountNeeded(e.target.value)}
              style={inputStyle}
            />
          </Box>

          <Button type="submit" w="full" h="55px" bg="brand.primary" color="white" _hover={{ opacity: 0.9 }} size="lg" mt={2}>
            Générer la simulation ➔
          </Button>
        </VStack>
      </Container>
    </Box>
  );
}