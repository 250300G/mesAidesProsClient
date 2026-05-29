// pages/NotFound.jsx
import { Box, Container, Heading, Text, Button, VStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function NotFound() {
  return (
    <Box minH="80vh" display="flex" alignItems="center" bg="brand.bgLight" px={4}>
      <Container maxW="md" textAlign="center">
        <VStack spacing={5}>
          <Text fontSize="6xl">404</Text>
          <Heading size="lg" color="brand.primary" fontWeight="black">
            Page introuvable
          </Heading>
          <Text color="brand.secondary" fontSize="sm">
            Cette page n'existe pas ou a été déplacée.
          </Text>
          <VStack spacing={3} w="full">
            <Button
              as={RouterLink}
              to="/"
              bg="brand.primary"
              color="white"
              w="full"
              borderRadius="xl"
              _hover={{ opacity: 0.9 }}
            >
              ← Retour à l'accueil
            </Button>
            <Button
              as={RouterLink}
              to="/funds"
              variant="outline"
              w="full"
              borderRadius="xl"
              color="brand.secondary"
            >
              Explorer les aides
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
