import { Box, Heading, Text } from "@chakra-ui/react";

export default function Profile() {
  return (
    <Box p={8}>
      <Heading size="lg" color="brand.primary">Configuration de la Structure</Heading>
      <Text mt={2} color="brand.secondary">Modification des informations légales de votre entreprise.</Text>
    </Box>
  );
}