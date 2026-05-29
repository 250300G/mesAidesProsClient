// pages/FundsExplorerPage.jsx
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import service from "../services/index.services";
import {
  Box, Flex, Text, Input, Spinner, VStack, Heading, Badge,
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody,
  DrawerCloseButton, useDisclosure, Button, Select, HStack,
  InputGroup, InputLeftElement, Divider, Stack,
} from "@chakra-ui/react";

// Catégories techniques mappées sur le champ "category" du Fund
const CATEGORIES = [
  { key: "",        label: "Toutes les aides",       icon: "🗂️" },
  { key: "R&D",     label: "Innovation & R&D",        icon: "🔬" },
  { key: "ENERGY",  label: "Transition écologique",   icon: "🌱" },
  { key: "HIRING",  label: "Emploi & Alternance",     icon: "👥" },
  { key: "DIGITAL", label: "Numérique & Digital",     icon: "💻" },
  { key: "OTHER",   label: "Autres dispositifs",      icon: "📋" },
];

const CATEGORY_COLORS = {
  "R&D":    "purple", ENERGY: "green",
  HIRING:   "blue",   DIGITAL: "cyan", OTHER: "gray",
};

export default function FundsExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync filtres avec URL (SEO + partage de lien)
  const [search,          setSearch]          = useState(searchParams.get("search")   || "");
  const [selectedCategory,setSelectedCategory]= useState(searchParams.get("category") || "");
  const [selectedProject, setSelectedProject] = useState(searchParams.get("project")  || "");
  const [nafFilter,       setNafFilter]       = useState(searchParams.get("naf")      || "");
  const [page,            setPage]            = useState(1);

  const [funds,    setFunds]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  const [selectedFund, setSelectedFund] = useState(null);
  const { isOpen, onOpen, onClose }     = useDisclosure();

  const LIMIT = 15;

  // Charge les projets distincts (une seule fois)
  useEffect(() => {
    service.get("/funds/projects")
      .then((r) => setProjects(r.data || []))
      .catch(console.error);
  }, []);

  // Charge les aides à chaque changement de filtre
  const loadFunds = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search.trim())          params.search   = search.trim();
      if (selectedCategory)       params.category = selectedCategory;
      if (selectedProject)        params.project  = selectedProject;
      if (nafFilter.trim())       params.naf      = nafFilter.trim().toUpperCase().replace(/\./g, "");

      const r = await service.get("/funds/explorer", { params });
      setFunds(r.data.funds   || []);
      setTotal(r.data.total   || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, selectedProject, nafFilter, page]);

  useEffect(() => { loadFunds(); }, [loadFunds]);

  // Sync URL params (SEO)
  useEffect(() => {
    const p = {};
    if (search)          p.search   = search;
    if (selectedCategory)p.category = selectedCategory;
    if (selectedProject) p.project  = selectedProject;
    if (nafFilter)       p.naf      = nafFilter;
    setSearchParams(p, { replace: true });
  }, [search, selectedCategory, selectedProject, nafFilter]);

  // Reset page quand les filtres changent
  const applyFilter = (setter, value) => { setter(value); setPage(1); };

  const openDetail = (fund) => { setSelectedFund(fund); onOpen(); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Flex h="calc(100vh - 70px)" bg="gray.50" overflow="hidden">

      {/* ══════════════════════════════════
          SIDEBAR GAUCHE
      ══════════════════════════════════ */}
      <Box
        w={{ base: "full", md: "280px" }}
        minW={{ md: "280px" }}
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        p={4}
        overflowY="auto"
        display={{ base: "none", md: "flex" }}
        flexDirection="column"
        gap={4}
      >
        <Heading size="sm" color="brand.primary" fontWeight="black" pt={1}>
          Explorer les aides
        </Heading>

        {/* Recherche texte */}
        <InputGroup size="sm">
          <InputLeftElement pointerEvents="none" color="gray.400" fontSize="14px">🔍</InputLeftElement>
          <Input
            pl={8}
            placeholder="Mot-clé, titre..."
            value={search}
            onChange={(e) => applyFilter(setSearch, e.target.value)}
            borderRadius="lg"
            focusBorderColor="brand.accent"
          />
        </InputGroup>

        {/* Filtre NAF */}
        <Box>
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>
            Code NAF
          </Text>
          <Input
            size="sm"
            placeholder="Ex: 6201Z"
            value={nafFilter}
            onChange={(e) => applyFilter(setNafFilter, e.target.value)}
            fontFamily="mono"
            borderRadius="lg"
            focusBorderColor="brand.accent"
          />
        </Box>

        <Divider />

        {/* Catégories techniques */}
        <Box>
          <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
            Catégorie
          </Text>
          <VStack align="stretch" spacing={1}>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.key}
                size="sm"
                justifyContent="flex-start"
                variant="ghost"
                fontWeight={selectedCategory === cat.key ? "700" : "400"}
                color={selectedCategory === cat.key ? "brand.primary" : "gray.600"}
                bg={selectedCategory === cat.key ? "gray.100" : "transparent"}
                borderLeft={selectedCategory === cat.key ? "3px solid" : "3px solid transparent"}
                borderColor={selectedCategory === cat.key ? "brand.accent" : "transparent"}
                borderRadius="md"
                onClick={() => { applyFilter(setSelectedCategory, cat.key); applyFilter(setSelectedProject, ""); }}
                _hover={{ bg: "gray.50", color: "brand.primary" }}
              >
                {cat.icon} &nbsp;{cat.label}
              </Button>
            ))}
          </VStack>
        </Box>

        {/* Projets distincts (issus de la DB) */}
        {projects.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>
                Par projet
              </Text>
              <VStack align="stretch" spacing={1} maxH="220px" overflowY="auto">
                {projects.map((proj) => (
                  <Button
                    key={proj}
                    size="xs"
                    justifyContent="flex-start"
                    variant="ghost"
                    whiteSpace="normal"
                    h="auto"
                    py={2}
                    textAlign="left"
                    fontSize="12px"
                    fontWeight={selectedProject === proj ? "600" : "400"}
                    color={selectedProject === proj ? "brand.primary" : "gray.500"}
                    bg={selectedProject === proj ? "gray.100" : "transparent"}
                    onClick={() => { applyFilter(setSelectedProject, proj); applyFilter(setSelectedCategory, ""); }}
                    _hover={{ bg: "gray.50", color: "brand.primary" }}
                  >
                    {proj}
                  </Button>
                ))}
              </VStack>
            </Box>
          </>
        )}

        {/* Lien simulation */}
        <Box mt="auto" pt={4}>
          <Button
            as={RouterLink}
            to="/simulation"
            size="sm"
            w="full"
            bg="brand.primary"
            color="white"
            borderRadius="xl"
            _hover={{ opacity: 0.9 }}
          >
            Simulation personnalisée ✨
          </Button>
        </Box>
      </Box>

      {/* ══════════════════════════════════
          ZONE PRINCIPALE
      ══════════════════════════════════ */}
      <Box flex="1" overflowY="auto" p={{ base: 4, md: 6 }}>

        {/* Header zone */}
        <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
          <Box>
            <Heading size="md" color="brand.primary" fontWeight="black">
              {selectedCategory
                ? CATEGORIES.find((c) => c.key === selectedCategory)?.label || "Aides"
                : selectedProject || "Toutes les aides"}
            </Heading>
            <Text fontSize="xs" color="gray.500" mt={0.5}>
              {loading ? "Chargement..." : `${total} dispositif${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`}
            </Text>
          </Box>

          {/* Filtres mobiles (Select compact) */}
          <HStack display={{ base: "flex", md: "none" }} wrap="wrap">
            <Select size="xs" value={selectedCategory} onChange={(e) => applyFilter(setSelectedCategory, e.target.value)} maxW="140px">
              {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </Select>
            <Input size="xs" placeholder="Recherche..." value={search} onChange={(e) => applyFilter(setSearch, e.target.value)} maxW="120px" />
          </HStack>
        </Flex>

        {/* Chips filtres actifs */}
        {(search || selectedCategory || selectedProject || nafFilter) && (
          <HStack mb={4} wrap="wrap" spacing={2}>
            {search && <Badge colorScheme="blue" borderRadius="md" px={2} py={1} cursor="pointer" onClick={() => applyFilter(setSearch, "")}>🔍 {search} ✕</Badge>}
            {selectedCategory && <Badge colorScheme="purple" borderRadius="md" px={2} py={1} cursor="pointer" onClick={() => applyFilter(setSelectedCategory, "")}>{CATEGORIES.find(c=>c.key===selectedCategory)?.label} ✕</Badge>}
            {selectedProject && <Badge colorScheme="teal" borderRadius="md" px={2} py={1} cursor="pointer" onClick={() => applyFilter(setSelectedProject, "")}>{selectedProject} ✕</Badge>}
            {nafFilter && <Badge colorScheme="orange" borderRadius="md" px={2} py={1} cursor="pointer" onClick={() => applyFilter(setNafFilter, "")}>NAF: {nafFilter} ✕</Badge>}
          </HStack>
        )}

        {/* Liste des aides */}
        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="brand.accent" thickness="4px" />
          </Flex>
        ) : funds.length === 0 ? (
          <Flex direction="column" align="center" justify="center" h="200px" gap={3}>
            <Text fontSize="3xl">🔍</Text>
            <Text color="gray.500" fontWeight="medium">Aucun dispositif trouvé pour ces critères.</Text>
            <Button size="sm" variant="outline" onClick={() => { applyFilter(setSearch, ""); applyFilter(setSelectedCategory, ""); applyFilter(setSelectedProject, ""); applyFilter(setNafFilter, ""); }}>
              Réinitialiser les filtres
            </Button>
          </Flex>
        ) : (
          <VStack spacing={3} align="stretch">
            {funds.map((fund) => (
              <Box
                key={fund._id}
                bg="white"
                p={5}
                borderRadius="xl"
                shadow="sm"
                border="1px solid"
                borderColor="gray.200"
                cursor="pointer"
                onClick={() => openDetail(fund)}
                _hover={{ shadow: "md", borderColor: "brand.accent", transform: "translateY(-1px)" }}
                transition="all 0.15s"
              >
                <Flex justify="space-between" align="flex-start" gap={3}>
                  <Box flex="1" minW={0}>
                    <Flex align="center" gap={2} mb={1} wrap="wrap">
                      {fund.category && (
                        <Badge
                          colorScheme={CATEGORY_COLORS[fund.category] || "gray"}
                          fontSize="9px"
                          px={2}
                          borderRadius="md"
                        >
                          {fund.category}
                        </Badge>
                      )}
                      {fund.nature?.slice(0, 2).map((n) => (
                        <Badge key={n} variant="outline" colorScheme="gray" fontSize="9px" px={2} borderRadius="md">{n}</Badge>
                      ))}
                    </Flex>

                    <Heading
                      as="h3"
                      size="sm"
                      color="brand.primary"
                      fontWeight="bold"
                      mb={1}
                      noOfLines={2}
                    >
                      {fund.title}
                    </Heading>

                    <Text color="gray.500" fontSize="xs" noOfLines={2} lineHeight="1.5">
                      {fund.description}
                    </Text>

                    {fund.financeur?.nom && (
                      <Text fontSize="10px" color="gray.400" mt={2}>
                        📌 {fund.financeur.nom}
                      </Text>
                    )}
                  </Box>

                  <Box textAlign="right" flexShrink={0}>
                    <Text fontWeight="black" color="brand.accent" fontSize="md">
                      {fund.maxAmount
                        ? `${fund.maxAmount.toLocaleString("fr-FR")} €`
                        : "Variable"}
                    </Text>
                    {fund.paymentDelayInDays > 0 && (
                      <Text fontSize="10px" color="gray.400" mt={0.5}>
                        ⏱ {fund.paymentDelayInDays}j
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <HStack justify="center" mt={6} spacing={2}>
            <Button
              size="sm"
              variant="outline"
              isDisabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Précédent
            </Button>
            <Text fontSize="sm" color="gray.500">
              Page {page} / {totalPages}
            </Text>
            <Button
              size="sm"
              variant="outline"
              isDisabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant →
            </Button>
          </HStack>
        )}
      </Box>

      {/* ══════════════════════════════════
          DRAWER DÉTAIL
      ══════════════════════════════════ */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" pr={10}>
            <Text fontSize="sm" fontWeight="black" color="brand.primary" noOfLines={2}>
              {selectedFund?.title}
            </Text>
            {selectedFund?.category && (
              <Badge colorScheme={CATEGORY_COLORS[selectedFund.category] || "gray"} mt={1} fontSize="9px">
                {selectedFund.category}
              </Badge>
            )}
          </DrawerHeader>

          <DrawerBody>
            <Stack spacing={5} mt={4}>

              {/* Montant */}
              <Box bg="brand.primary" color="white" p={4} borderRadius="xl">
                <Text fontSize="xs" color="gray.300" fontWeight="bold" mb={1}>Plafond théorique</Text>
                <Text fontSize="2xl" fontWeight="black">
                  {selectedFund?.maxAmount
                    ? `${selectedFund.maxAmount.toLocaleString("fr-FR")} €`
                    : "Montant variable"}
                </Text>
                {selectedFund?.montantTexte && (
                  <Text fontSize="xs" color="gray.300" mt={2}>{selectedFund.montantTexte}</Text>
                )}
                {selectedFund?.paymentDelayInDays > 0 && (
                  <Text fontSize="xs" color="gray.300" mt={1}>⏱ Délai moyen : {selectedFund.paymentDelayInDays} jours</Text>
                )}
              </Box>

              {selectedFund?.description && (
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Description</Text>
                  <Text fontSize="sm" color="brand.primary" lineHeight="1.7">{selectedFund.description}</Text>
                </Box>
              )}

              {selectedFund?.conditions && (
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Conditions</Text>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.7">{selectedFund.conditions}</Text>
                </Box>
              )}

              {selectedFund?.modalites && (
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Modalités</Text>
                  <Text fontSize="sm" color="gray.700" lineHeight="1.7">{selectedFund.modalites}</Text>
                </Box>
              )}

              {selectedFund?.beneficiaires && (
                <Box bg="blue.50" p={3} borderRadius="lg">
                  <Text fontSize="10px" fontWeight="bold" color="blue.600" textTransform="uppercase" mb={1}>Bénéficiaires</Text>
                  <Text fontSize="sm" color="gray.700">{selectedFund.beneficiaires}</Text>
                </Box>
              )}

              {selectedFund?.profils?.length > 0 && (
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={2}>Profils concernés</Text>
                  <Flex gap={2} wrap="wrap">
                    {selectedFund.profils.map((p) => (
                      <Badge key={p} colorScheme="blue" variant="subtle" borderRadius="md" px={2} py={1} fontSize="11px">{p}</Badge>
                    ))}
                  </Flex>
                </Box>
              )}

              {selectedFund?.financeur?.nom && (
                <Box>
                  <Text fontSize="10px" fontWeight="bold" color="gray.400" textTransform="uppercase" mb={1}>Financeur</Text>
                  <Text fontSize="sm" color="brand.primary">{selectedFund.financeur.nom}</Text>
                </Box>
              )}

              {selectedFund?.contact?.site && (
                <Button
                  as="a"
                  href={selectedFund.contact.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="sm"
                  variant="outline"
                  w="full"
                  borderRadius="xl"
                >
                  Accéder au site officiel →
                </Button>
              )}

              <Divider />
              <Button
                as={RouterLink}
                to="/simulation"
                bg="brand.accent"
                color="white"
                size="md"
                borderRadius="xl"
                w="full"
                _hover={{ opacity: 0.9 }}
                onClick={onClose}
              >
                Vérifier mon éligibilité ✨
              </Button>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
}
