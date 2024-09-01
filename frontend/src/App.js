import React, { useState, useEffect } from 'react';
import { Box, VStack, Grid, useColorModeValue, useToast } from "@chakra-ui/react";
import useWebSocket from 'react-use-websocket';
import Header from './components/Header';
import ProfileList from './components/ProfileList';
import ProfileDetail from './components/ProfileDetail';
import RemindersSection from './components/RemindersSection';
import SuggestionsSection from './components/SuggestionsSection';

const initialProfiles = [
  { id: 1, name: "Alice", relationship: "Spouse", birthday: "1985-03-15", likes: ["Reading", "Hiking", "Cooking"], dislikes: ["Loud noises", "Spicy food"], favoriteFood: "Italian cuisine", favoriteMovie: "The Shawshank Redemption", hobbies: ["Photography", "Gardening"] },
  { id: 2, name: "Bob", relationship: "Kid", birthday: "2010-07-22", likes: ["Video games", "Soccer"], dislikes: ["Vegetables", "Early bedtime"], favoriteFood: "Pizza", favoriteMovie: "Toy Story", hobbies: ["Drawing", "Lego building"] },
  { id: 3, name: "Carol", relationship: "Parent", birthday: "1955-11-30", likes: ["Gardening", "Knitting"], dislikes: ["Technology", "Loud music"], favoriteFood: "Homemade soup", favoriteMovie: "Gone with the Wind", hobbies: ["Birdwatching", "Crossword puzzles"] },
  { id: 4, name: "David", relationship: "Friend", birthday: "1988-09-03", likes: ["Sports", "Traveling"], dislikes: ["Cold weather", "Crowds"], favoriteFood: "Sushi", favoriteMovie: "Inception", hobbies: ["Running", "Photography"] },
];

function App() {
  const [profiles, setProfiles] = useState(initialProfiles);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [suggestions, setSuggestions] = useState('');
  const { sendMessage, lastMessage, readyState } = useWebSocket('ws://localhost:8000/ws', {
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000,
  });
  const toast = useToast();

  const handleProfileSelect = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
  };

  const handleCreateProfile = (newProfile) => {
    setProfiles([...profiles, { ...newProfile, id: profiles.length + 1 }]);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfiles(profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile));
    setSelectedProfile(updatedProfile);
  };

  const handleDeleteProfile = (profileId) => {
    setProfiles(profiles.filter(profile => profile.id !== profileId));
    setSelectedProfile(null);
    toast({
      title: "Profile deleted",
      description: "The profile has been successfully removed.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleOpenModal = (profile = null) => {
    setSelectedProfile(profile);
  };

  const bg = useColorModeValue("gray.800", "gray.900");
  const color = useColorModeValue("gray.100", "gray.50");

  useEffect(() => {
    if (lastMessage !== null) {
      const messageData = JSON.parse(lastMessage.data);
      if (messageData.action === 'suggestion_response') {
        setSuggestions(messageData.suggestion);
        toast({
          title: "New suggestion received",
          description: "A new suggestion has been generated for the selected profile.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [lastMessage, toast]);

  return (
    <Box textAlign="center" fontSize="xl" bg={bg} color={color}>
      <Grid minH="100vh" p={3}>
        <VStack spacing={8}>
          <Header />
          <Grid templateColumns="repeat(3, 1fr)" gap={6} width="100%">
            <ProfileList
              profiles={profiles}
              onSelectProfile={handleProfileSelect}
              onCreateProfile={handleCreateProfile}
              onUpdateProfile={handleUpdateProfile}
              handleOpenModal={handleOpenModal}
            />
            <ProfileDetail
              profile={selectedProfile}
              handleOpenModal={handleOpenModal}
              onDeleteProfile={handleDeleteProfile}
              onUpdateProfile={handleUpdateProfile}
              sendMessage={sendMessage}
              lastMessage={lastMessage}
            />
            <VStack spacing={4}>
              <RemindersSection selectedProfile={selectedProfile} />
              <SuggestionsSection
                selectedProfile={selectedProfile}
                sendMessage={sendMessage}
                suggestions={suggestions}
              />
            </VStack>
          </Grid>
        </VStack>
      </Grid>
    </Box>
  );
}

export default App;
