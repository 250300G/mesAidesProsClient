import { useState, useEffect } from "react";
import service from "../services/index.services";
import {
  Box, Container, Heading, Text, Input, Button, VStack, FormControl,
  FormLabel, SimpleGrid, Flex, Spinner, useToast, Divider, Badge
} from "@chakra-ui/react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    service.get("/auth/me")
      .then(res => {
        setUser(res.data);
        setFormData({
          username: res.data.username || "",
          companyName: res.data.companyName || "",
          codeNaf: res.data.codeNaf || "",
          region: res.data.region || "",
          revenue: res.data.revenue || "",
          employeeCount: res.data.employeeCount || ""
        });
      })
      .catch(() => toast({ title: "Erreur de chargement", status: "error", duration: 3000 }))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = field => e => setFormData(p => ({ ...p, [field]: e.target.value }));

  // ✅ PUT /api/auth/me — vraiment branché maintenant
  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await service.put("/auth/me", {
        ...formData,
        revenue: formData.revenue ? Number(formData.revenue) : 0,
        employeeCount: formData.employeeCount ? Number(formData.employeeCount) : 0
      });
      setUser(res.data);
      toast({ title: "Configuration sauvegardée", status: "success", duration: 3000 });
    } catch (err) {
      toast({ title: err.response?.data?.errorMessage || "Erreur de sauvegarde", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Flex minH="70vh" justify="center" align="center"><Spinner size="xl" color="brand.primary" thickness="4px" /></Flex>;

  return (
    <Box minH="90vh" bg="brand.bgLight" py={8}>
      <Container maxW="container.md">
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="xl" color="brand.primary" fontWeight="black">Configuration</Heading>
            <Text color="brand.secondary" mt={1} fontSize="sm">Informations légales de votre structure.</Text>
          </Box>
        </Flex>

        {/* Infos non modifiables */}
        <Box bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="brand.border" mb={6}>
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={3}>Identifiants sécurisés</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Box>
              <Text fontSize="xs" color="gray.400" fontWeight="bold">Email</Text>
              <Text fontSize="sm" color="brand.primary" fontWeight="semibold">{user?.email}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400" fontWeight="bold">SIRET</Text>
              <Text fontSize="sm" color="brand.primary" fontFamily="mono" fontWeight="semibold">{user?.siret}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400" fontWeight="bold">SIREN</Text>
              <Text fontSize="sm" color="brand.primary" fontFamily="mono">{user?.siren}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.400" fontWeight="bold">Rôle</Text>
              <Badge colorScheme={user?.role === "admin" ? "red" : "blue"}>{user?.role}</Badge>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Formulaire modifiable — PUT /auth/me */}
        <Box bg="white" p={6} borderRadius="xl" shadow="sm" border="1px solid" borderColor="brand.border">
          <Text fontSize="xs" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={4}>Informations entreprise</Text>
          <VStack as="form" onSubmit={handleSave} spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Nom d'utilisateur</FormLabel>
                <Input value={formData.username} onChange={handleChange("username")} focusBorderColor="brand.accent" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Raison sociale</FormLabel>
                <Input value={formData.companyName} onChange={handleChange("companyName")} focusBorderColor="brand.accent" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Code NAF</FormLabel>
                <Input value={formData.codeNaf} onChange={handleChange("codeNaf")} fontFamily="mono" focusBorderColor="brand.accent" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Région</FormLabel>
                <Input value={formData.region} onChange={handleChange("region")} focusBorderColor="brand.accent" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">CA annuel (€)</FormLabel>
                <Input type="number" min="0" value={formData.revenue} onChange={handleChange("revenue")} focusBorderColor="brand.accent" />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="brand.primary">Effectif salarié</FormLabel>
                <Input type="number" min="0" value={formData.employeeCount} onChange={handleChange("employeeCount")} focusBorderColor="brand.accent" />
              </FormControl>
            </SimpleGrid>
            <Button type="submit" isLoading={saving} loadingText="Sauvegarde..." bg="brand.primary" color="white" _hover={{ opacity: 0.9 }} borderRadius="xl" h="50px" mt={2}>
              Sauvegarder les modifications
            </Button>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
