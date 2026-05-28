import { useEffect, useState } from "react";

import service from "../services/index.services";

import {
  Box,
  Flex,
  Text,
  Input,
  Spinner,
  VStack,
  Heading,
  Badge,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Button,
} from "@chakra-ui/react";

export default function FundsExplorerPage() {

  const [funds, setFunds] = useState([]);

  const [projects, setProjects] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");

  const [selectedFund, setSelectedFund] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();


  // ===================================================
  // LOAD PROJECTS
  // ===================================================

  useEffect(() => {

    async function loadProjects() {

      try {

        const response = await service.get("/funds/projects");

        setProjects(response.data);

      } catch (error) {

        console.log(error);
      }
    }

    loadProjects();

  }, []);


  // ===================================================
  // LOAD FUNDS
  // ===================================================

  useEffect(() => {

    async function loadFunds() {

      try {

        setLoading(true);

        const response = await service.get("/funds/explorer", {
          params: {
            search,
            project: selectedProject,
          },
        });

        setFunds(response.data.funds);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);
      }
    }

    loadFunds();

  }, [search, selectedProject]);


  return (

    <Flex h="calc(100vh - 70px)" bg="gray.50">

      {/* ========================================= */}
      {/* SIDEBAR */}
      {/* ========================================= */}

      <Box
        w="320px"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        p={4}
        overflowY="auto"
        display={{ base: "none", md: "block" }}
      >

        <Heading size="md" mb={4}>
          Explorer les aides
        </Heading>

        <Input
          placeholder="Recherche..."
          mb={4}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <VStack align="stretch" spacing={2}>

          <Button
            variant={!selectedProject ? "solid" : "ghost"}
            onClick={() => setSelectedProject("")}
          >
            Toutes les aides
          </Button>

          {projects.map((project) => (

            <Button
              key={project}
              justifyContent="flex-start"
              variant={selectedProject === project ? "solid" : "ghost"}
              onClick={() => setSelectedProject(project)}
              whiteSpace="normal"
              h="auto"
              py={3}
            >
              {project}
            </Button>
          ))}
        </VStack>
      </Box>


      {/* ========================================= */}
      {/* LISTE */}
      {/* ========================================= */}

      <Box flex="1" overflowY="auto" p={6}>

        {loading ? (

          <Spinner />

        ) : (

          <VStack spacing={4} align="stretch">

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
                onClick={() => {
                  setSelectedFund(fund);
                  onOpen();
                }}
              >

                <Flex justify="space-between" align="start">

                  <Box>

                    <Heading size="md" mb={2}>
                      {fund.title}
                    </Heading>

                    <Text
                      color="gray.600"
                      fontSize="sm"
                      noOfLines={3}
                    >
                      {fund.description}
                    </Text>

                    <Flex mt={3} gap={2} wrap="wrap">

                      {fund.nature?.map((item) => (
                        <Badge key={item}>
                          {item}
                        </Badge>
                      ))}

                    </Flex>
                  </Box>

                  <Box textAlign="right">

                    <Text
                      fontWeight="bold"
                      color="green.500"
                    >
                      {fund.maxAmount
                        ? `${fund.maxAmount.toLocaleString()} €`
                        : "Montant variable"}
                    </Text>

                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        )}
      </Box>


      {/* ========================================= */}
      {/* DRAWER DETAIL */}
      {/* ========================================= */}

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="lg"
      >

        <DrawerOverlay />

        <DrawerContent>

          <DrawerHeader borderBottomWidth="1px">

            {selectedFund?.title}

          </DrawerHeader>

          <DrawerBody>

            <VStack align="stretch" spacing={5} mt={4}>

              <Box>
                <Text fontWeight="bold">
                  Description
                </Text>

                <Text mt={2}>
                  {selectedFund?.description}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold">
                  Conditions
                </Text>

                <Text mt={2}>
                  {selectedFund?.conditions}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold">
                  Modalités
                </Text>

                <Text mt={2}>
                  {selectedFund?.modalites}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="bold">
                  Profils concernés
                </Text>

                <Flex mt={2} gap={2} wrap="wrap">

                  {selectedFund?.profils?.map((profil) => (
                    <Badge key={profil}>
                      {profil}
                    </Badge>
                  ))}
                </Flex>
              </Box>

            </VStack>

          </DrawerBody>

        </DrawerContent>

      </Drawer>

    </Flex>
  );
}