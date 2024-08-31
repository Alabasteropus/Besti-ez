import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, useToast } from "@chakra-ui/react";
import axios from 'axios';

const RemindersSection = ({ selectedProfile }) => {
  const [reminders, setReminders] = useState([]);
  const [suggestions, setSuggestions] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (selectedProfile) {
      fetchReminders();
      fetchSuggestions();
    }
  }, [selectedProfile]);

  const fetchReminders = () => {
    // Mock data for now, replace with actual API call later
    const upcomingEvents = [
      { id: 1, type: 'Birthday', date: '2023-07-22', name: selectedProfile.name },
      { id: 2, type: 'Anniversary', date: '2023-08-15', name: selectedProfile.name },
    ];
    setReminders(upcomingEvents);
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.post(`/profiles/${selectedProfile.id}/query`, {
        query: `Suggest a personalized gift or activity for ${selectedProfile.name}'s upcoming event.`
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
    }
  };

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white">
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Upcoming Events</Heading>
        {reminders.map((reminder) => (
          <Box key={reminder.id} p={2} borderWidth={1} borderRadius="md">
            <Text>{reminder.type} - {reminder.date}</Text>
            <Text fontWeight="bold">{reminder.name}</Text>
          </Box>
        ))}
        <Heading size="sm">Suggestions</Heading>
        <Text>{suggestions}</Text>
        <Button onClick={fetchSuggestions} colorScheme="blue">
          Get New Suggestion
        </Button>
      </VStack>
    </Box>
  );
};

export default RemindersSection;
