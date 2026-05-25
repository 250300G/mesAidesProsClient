import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Heading, Text, Input, Button, VStack, FormControl } from "@chakra-ui/react";

export default function HomePage() {
  const [siret, setSiret] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Nettoyage des espaces
    const cleanSiret = siret.replace(/\s/g, "");
    // Validation stricte à 14 chiffres
    const isValid = /^\d{14}$/.test(cleanSiret);

    if (!isValid) {
      setError("Le numéro SIRET doit comporter exactement 14 chiffres.");
      return;
    }

    setError("");
    // Redirection vers l'Écran 2 (Simulation) avec le SIRET dans l'URL
    navigate(`/simulation?siret=${cleanSiret}`);
  };

  return (
    <Box minH="80vh" display="flex" alignItems="center" px={4} bg="brand.bgLight">
      <Container maxW="xl" textAlign="center">
        <VStack spacing={6}>
          
          <Heading as="h1" size="xl" color="brand.primary" fontWeight="black" letterSpacing="tight">
            Identifiez vos subventions en <Text as="span" color="brand.accent">3 secondes</Text>
          </Heading>
          
          <Text fontSize="md" color="brand.secondary" maxW="lg">
            Entrez le numéro SIRET de votre entreprise pour analyser instantanément son éligibilité auprès de notre moteur prédictif.
          </Text>

          <Box as="form" onSubmit={handleSubmit} w="full" mt={2}>
            <FormControl isInvalid={!!error}>
              <Input
                type="text"
                maxLength={14}
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                placeholder="Ex: 123 456 789 00014"
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
                <Text color="red.500" fontSize="sm" mt={2} textAlign="center" fontWeight="medium">
                  ⚠️ {error}
                </Text>
              )}
            </FormControl>

            <Button 
              type="submit" 
              w="full" 
              h="60px" 
              mt={4} 
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

        </VStack>
      </Container>
    </Box>
  );
}