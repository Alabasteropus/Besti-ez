import React, { useState } from 'react';
import { Box, VStack, Grid, useColorModeValue } from "@chakra-ui/react";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileSelect = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
  };

  const handleCreateProfile = (newProfile) => {
    setProfiles([...profiles, { ...newProfile, id: profiles.length + 1 }]);
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfiles(profiles.map(profile => profile.id === updatedProfile.id ? updatedProfile : profile));
  };

  const handleOpenModal = (profile = null) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const bg = useColorModeValue("gray.800", "gray.900");
  const color = useColorModeValue("gray.100", "gray.50");

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
            <ProfileDetail profile={selectedProfile} handleOpenModal={handleOpenModal} />
            <VStack spacing={4}>
              <RemindersSection selectedProfile={selectedProfile} />
              <SuggestionsSection selectedProfile={selectedProfile} />
            </VStack>
          </Grid>
        </VStack>
      </Grid>
    </Box>
  );
}

export default App;
