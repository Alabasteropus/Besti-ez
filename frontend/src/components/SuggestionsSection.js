import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, useToast } from "@chakra-ui/react";
import axios from 'axios';

// Configure axios with the base URL
axios.defaults.baseURL = 'http://localhost:8000';

const SuggestionsSection = ({ selectedProfile }) => {
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (selectedProfile) {
      fetchSuggestions();
    }
  }, [selectedProfile]);

  const fetchSuggestions = async () => {
    if (!selectedProfile) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`/profiles/${selectedProfile.id}/query`, {
        query: `Suggest a personalized gift or activity for ${selectedProfile.name} based on their interests and preferences.`
      });
      setSuggestions(response.data.response);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch suggestions. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white">
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Suggestions</Heading>
        {selectedProfile ? (
          <>
            <Text>{suggestions || 'No suggestions available yet.'}</Text>
            <Button
              onClick={fetchSuggestions}
              colorScheme="blue"
              isLoading={isLoading}
            >
              Get New Suggestion
            </Button>
          </>
        ) : (
          <Text color="gray.500">Select a profile to see suggestions</Text>
        )}
      </VStack>
    </Box>
  );
};

export default SuggestionsSection;
