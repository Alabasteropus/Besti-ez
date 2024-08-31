import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, useToast } from "@chakra-ui/react";
import useWebSocket, { ReadyState } from 'react-use-websocket';

const SuggestionsSection = ({ selectedProfile }) => {
  const [suggestions, setSuggestions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8000/ws');

  useEffect(() => {
    if (selectedProfile) {
      fetchSuggestions();
    }
  }, [selectedProfile]);

  const fetchSuggestions = () => {
    if (!selectedProfile) return;

    setIsLoading(true);
    setSuggestions(''); // Clear previous suggestions
    try {
      sendMessage(JSON.stringify({
        action: 'query_gpt4o',
        profile_id: selectedProfile.id,
        query: `Suggest a personalized gift or activity for ${selectedProfile.name} based on their interests and preferences.`
      }));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      showErrorToast('Failed to fetch suggestions. Please try again later.');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (lastMessage !== null) {
      try {
        const data = JSON.parse(lastMessage.data);
        if (data.action === 'suggestion_response' && data.suggestion) {
          setSuggestions(data.suggestion);
        } else if (data.error) {
          console.error('Error from WebSocket:', data.error);
          showErrorToast('Failed to process the suggestion. Please try again.');
        } else {
          console.warn('Unexpected WebSocket response:', data);
          showErrorToast('Failed to process the suggestion. Please try again.');
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        showErrorToast('Failed to process the suggestion. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [lastMessage, toast]);

  const showErrorToast = (message) => {
    toast({
      title: 'Error',
      description: message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

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
              isDisabled={readyState !== ReadyState.OPEN}
              data-loading={isLoading}
              data-testid="get-suggestion-button"
            >
              Get New Suggestion
            </Button>
            <Text fontSize="sm" color="gray.500">
              WebSocket: {connectionStatus}
            </Text>
          </>
        ) : (
          <Text color="gray.500">Select a profile to see suggestions</Text>
        )}
      </VStack>
    </Box>
  );
};

export default SuggestionsSection;
