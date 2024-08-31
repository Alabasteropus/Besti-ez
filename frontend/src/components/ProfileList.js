import React, { useState } from 'react';
import { Box, VStack, Heading, List, ListItem, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, FormControl, FormLabel, Image, useDisclosure } from "@chakra-ui/react";

const ProfileList = ({ profiles, onSelectProfile, onCreateProfile, onUpdateProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState({ name: '', relationship: '', birthday: '', likes: '', dislikes: '', favoriteFood: '', favoriteMovie: '', hobbies: '', imageUrl: 'default-profile-pic.png' });

  const groupedProfiles = profiles.reduce((acc, profile) => {
    if (!acc[profile.relationship]) {
      acc[profile.relationship] = [];
    }
    acc[profile.relationship].push(profile);
    return acc;
  }, {});

  const handleOpenModal = (profile = null) => {
    if (profile) {
      setCurrentProfile(profile);
      setIsEditing(true);
    } else {
      setCurrentProfile({ name: '', relationship: '', birthday: '', likes: '', dislikes: '', favoriteFood: '', favoriteMovie: '', hobbies: '', imageUrl: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveProfile = () => {
    const profileWithImage = { ...currentProfile, imageUrl: currentProfile.imageUrl };
    if (isEditing) {
      onUpdateProfile(profileWithImage);
    } else {
      onCreateProfile(profileWithImage);
    }
    handleCloseModal();
  };

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white">
      <Heading size="md" mb={4}>Profiles</Heading>
      <Button colorScheme="blue" onClick={() => handleOpenModal()}>Add New Profile</Button>
      <VStack align="stretch" spacing={4} mt={4}>
        {Object.entries(groupedProfiles).map(([relationship, profiles]) => (
          <Box key={relationship}>
            <Heading size="sm" mb={2}>{relationship}</Heading>
            <List spacing={2}>
              {profiles.map(profile => (
                <ListItem
                  key={profile.id}
                  p={2}
                  _hover={{ bg: "gray.100" }}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onSelectProfile(profile.id)}
                >
                  <VStack spacing={1} align="center">
                    <Image
                      boxSize="50px"
                      borderRadius="full"
                      src={profile.imageUrl || 'default-profile-pic.png'}
                      alt={`${profile.name}'s thumbnail`}
                    />
                    <Text>{profile.name}</Text>
                  </VStack>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? 'Edit Profile' : 'Create Profile'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={currentProfile.name} onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Relationship</FormLabel>
              <Input value={currentProfile.relationship} onChange={(e) => setCurrentProfile({ ...currentProfile, relationship: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Birthday</FormLabel>
              <Input value={currentProfile.birthday} onChange={(e) => setCurrentProfile({ ...currentProfile, birthday: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Likes</FormLabel>
              <Input value={currentProfile.likes} onChange={(e) => setCurrentProfile({ ...currentProfile, likes: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Dislikes</FormLabel>
              <Input value={currentProfile.dislikes} onChange={(e) => setCurrentProfile({ ...currentProfile, dislikes: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Favorite Food</FormLabel>
              <Input value={currentProfile.favoriteFood} onChange={(e) => setCurrentProfile({ ...currentProfile, favoriteFood: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Favorite Movie</FormLabel>
              <Input value={currentProfile.favoriteMovie} onChange={(e) => setCurrentProfile({ ...currentProfile, favoriteMovie: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Hobbies</FormLabel>
              <Input value={currentProfile.hobbies} onChange={(e) => setCurrentProfile({ ...currentProfile, hobbies: e.target.value })} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Profile Picture</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  setCurrentProfile({ ...currentProfile, imageUrl });
                }
              }} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveProfile}>
              Save
            </Button>
            <Button variant="ghost" onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileList;
