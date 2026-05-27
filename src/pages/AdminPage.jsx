import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth.context";
import service from "../services/index.services";
import {
  Box, Container, Heading, Text, Input, Button, Flex, Table, Thead, Tbody,
  Tr, Th, Td, Badge, Spinner, useToast, Modal, ModalOverlay, ModalContent,
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter, FormControl,
  FormLabel, Select, useDisclosure, VStack, SimpleGrid
} from "@chakra-ui/react";
// ✅ Package externe non-CSS requis par l'école (Recharts)
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CATEGORY_OPTIONS = ["R&D", "HIRING", "ENERGY", "DIGITAL", "OTHER"];
const CATEGORY_COLORS = { "R&D": "#534AB7", HIRING: "#1D9E75", ENERGY: "#3B6D11", DIGITAL: "#185FA5", OTHER: "#888780" };

const EMPTY_FORM = { title: "", description: "", maxAmount: "", category: "OTHER", nafTarget: "ALL", regionTarget: "NATIONAL", paymentDelayInDays: "" };

export default function AdminPage() {
  const { loggedUserRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [funds, setFunds] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Guard — admin only
  useEffect(() => {
    if (loggedUserRole && loggedUserRole !== "admin") navigate("/dashboard");
  }, [loggedUserRole]);

  // READ
  const fetchFunds = async () => {
    try {
      const res = await service.get(`/funds?search=${search}&limit=50`);
      setFunds(res.data.funds || []);
    } catch (e) {
      toast({ title: "Erreur chargement", status: "error", duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFunds(); }, [search]);

  // Stats pour le chart
  const chartData = CATEGORY_OPTIONS.map(cat => ({
    name: cat,
    count: funds.filter(f => f.category === cat).length
  })).filter(d => d.count > 0);

  const handleChange = field => e => setFormData(p => ({ ...p, [field]: e.target.value }));

  const openCreate = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    onOpen();
  };

  const openEdit = fund => {
    setFormData({
      title: fund.title || "",
      description: fund.description || "",
      maxAmount: fund.maxAmount || "",
      category: fund.category || "OTHER",
      nafTarget: (fund.nafTarget || ["ALL"]).join(", "),
      regionTarget: (fund.regionTarget || ["NATIONAL"]).join(", "),
      paymentDelayInDays: fund.paymentDelayInDays || ""
    });
    setEditingId(fund._id);
    onOpen();
  };

  // CREATE or UPDATE
  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast({ title: "Titre et description requis.", status: "warning", duration: 2000 });
      return;
    }
    setSaving(true);
    const payload = {
      ...formData,
      maxAmount: Number(formData.maxAmount) || 0,
      paymentDelayInDays: Number(formData.paymentDelayInDays) || 0,
      nafTarget: formData.nafTarget.split(",").map(s => s.trim()).filter(Boolean),
      regionTarget: formData.regionTarget.split(",").map(s => s.trim()).filter(Boolean)
    };
    try {
      if (editingId) {
        await service.put(`/funds/${editingId}`, payload);
        toast({ title: "Dispositif mis à jour.", status: "success", duration: 2000 });
      } else {
        await service.post("/funds", payload);
        toast({ title: "Dispositif créé.", status: "success", duration: 2000 });
      }
      onClose();
      fetchFunds();
    } catch (e) {
      toast({ title: e.response?.data?.errorMessage || "Erreur", status: "error", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  // DELETE (soft)
  const handleDelete = async id => {
    try {
      await service.delete(`/funds/${id}`);
      toast({ title: "Dispositif archivé.", status: "info", duration: 2000 });
      setFunds(p => p.filter(f => f._id !== id));
    } catch (e) {
      toast({ title: "Erreur suppression.", status: "error", duration: 3000 });
    }
  };

  if (loading) return <Flex minH="70vh" justify="center" align="center"><Spinner size="xl" color="brand.primary" thickness="4px" /></Flex>;

  return (
    <Box minH="90vh" bg="brand.bgLight" py={8}>
      <Container maxW="container.xl">

        {/* Header */}
        <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={3}>
          <Box>
            <Heading size="xl" color="brand.primary" fontWeight="black">Administration</Heading>
            <Text color="brand.secondary" fontSize="sm">Catalogue des dispositifs — CRUD complet</Text>
          </Box>
          <Button bg="brand.primary" color="white" onClick={openCreate} _hover={{ opacity: 0.9 }}>
            + Nouveau dispositif
          </Button>
        </Flex>

        {/* Chart Recharts — package externe ✅ */}
        {chartData.length > 0 && (
          <Box bg="white" p={5} borderRadius="xl" shadow="sm" border="1px solid" borderColor="brand.border" mb={6}>
            <Text fontSize="sm" fontWeight="semibold" color="brand.primary" mb={3}>
              Répartition par catégorie
            </Text>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[entry.name] || "#888780"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}

        {/* Search */}
        <Input
          placeholder="Rechercher un dispositif..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          mb={4} bg="white" focusBorderColor="brand.accent"
        />

        {/* Table CRUD */}
        <Box bg="white" borderRadius="xl" shadow="md" overflow="hidden" border="1px solid" borderColor="brand.border">
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th color="brand.primary">Titre</Th>
                <Th color="brand.primary">Catégorie</Th>
                <Th color="brand.primary">Montant max</Th>
                <Th color="brand.primary">NAF</Th>
                <Th color="brand.primary">Région</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {funds.length === 0 ? (
                <Tr><Td colSpan={6} textAlign="center" py={8} color="brand.secondary">Aucun dispositif trouvé.</Td></Tr>
              ) : (
                funds.map(fund => (
                  <Tr key={fund._id} _hover={{ bg: "gray.50" }}>
                    <Td maxW="220px">
                      <Text fontSize="xs" fontWeight="semibold" color="brand.primary" noOfLines={1}>{fund.title}</Text>
                    </Td>
                    <Td>
                      <Badge fontSize="9px" colorScheme={
                        fund.category === "R&D" ? "purple" : fund.category === "HIRING" ? "green" :
                        fund.category === "ENERGY" ? "teal" : fund.category === "DIGITAL" ? "blue" : "gray"
                      }>{fund.category}</Badge>
                    </Td>
                    <Td fontSize="xs" fontWeight="bold" color="brand.accent">
                      {fund.maxAmount ? `${Number(fund.maxAmount).toLocaleString("fr-FR")} €` : "—"}
                    </Td>
                    <Td fontSize="xs" fontFamily="mono">{(fund.nafTarget || []).slice(0, 2).join(", ")}</Td>
                    <Td fontSize="xs">{(fund.regionTarget || []).slice(0, 2).join(", ")}</Td>
                    <Td textAlign="right">
                      <Flex gap={2} justify="flex-end">
                        <Button size="xs" variant="outline" onClick={() => openEdit(fund)}>Éditer</Button>
                        <Button size="xs" colorScheme="red" variant="ghost" onClick={() => handleDelete(fund._id)}>Archiver</Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>

        {/* Modal Create / Edit */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent borderRadius="2xl">
            <ModalHeader color="brand.primary" fontWeight="black">
              {editingId ? "Modifier le dispositif" : "Nouveau dispositif"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Titre</FormLabel>
                  <Input value={formData.title} onChange={handleChange("title")} focusBorderColor="brand.accent" />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Description</FormLabel>
                  <Input value={formData.description} onChange={handleChange("description")} focusBorderColor="brand.accent" />
                </FormControl>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">Montant max (€)</FormLabel>
                    <Input type="number" value={formData.maxAmount} onChange={handleChange("maxAmount")} focusBorderColor="brand.accent" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">Catégorie</FormLabel>
                    <Select value={formData.category} onChange={handleChange("category")}>
                      {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">NAF cibles (virgule)</FormLabel>
                    <Input fontFamily="mono" value={formData.nafTarget} onChange={handleChange("nafTarget")} placeholder="4321A, ALL" focusBorderColor="brand.accent" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">Régions (virgule)</FormLabel>
                    <Input value={formData.regionTarget} onChange={handleChange("regionTarget")} placeholder="IDF, NATIONAL" focusBorderColor="brand.accent" />
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm" fontWeight="semibold">Délai versement (jours)</FormLabel>
                    <Input type="number" value={formData.paymentDelayInDays} onChange={handleChange("paymentDelayInDays")} focusBorderColor="brand.accent" />
                  </FormControl>
                </SimpleGrid>
              </VStack>
            </ModalBody>
            <ModalFooter gap={2}>
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button bg="brand.primary" color="white" isLoading={saving} onClick={handleSave}>
                {editingId ? "Enregistrer" : "Créer"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Container>
    </Box>
  );
}
