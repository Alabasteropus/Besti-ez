import React, { useState } from 'react';
import { Box, VStack, Heading, List, ListItem, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, FormControl, FormLabel, Image, useColorModeValue } from "@chakra-ui/react";

const ProfileList = ({ profiles, onSelectProfile, onCreateProfile, onUpdateProfile, handleOpenModal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState({ name: '', relationship: '', birthday: '', likes: '', dislikes: '', favoriteFood: '', favoriteMovie: '', hobbies: '', imageUrl: 'default-profile-pic.png' });

  // Move useColorModeValue calls to the top level of the component
  const bgColor = useColorModeValue("white", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const relationshipColor = useColorModeValue("gray.600", "gray.300");
  const hoverBgColor = useColorModeValue("gray.100", "gray.600");
  const listItemBgColor = useColorModeValue("gray.50", "gray.800");
  const nameColor = useColorModeValue("gray.800", "gray.100");
  const modalBgColor = useColorModeValue("white", "gray.800");
  const modalHeaderColor = useColorModeValue("gray.800", "white");
  const formLabelColor = useColorModeValue("gray.700", "gray.200");
  const inputBgColor = useColorModeValue("white", "gray.700");
  const inputTextColor = useColorModeValue("gray.800", "white");
  const cancelButtonColor = useColorModeValue("gray.500", "gray.400");

  const groupedProfiles = profiles.reduce((acc, profile) => {
    if (!acc[profile.relationship]) {
      acc[profile.relationship] = [];
    }
    acc[profile.relationship].push(profile);
    return acc;
  }, {});

  const handleLocalOpenModal = (profile = null) => {
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
    <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg={bgColor}>
      <Heading size="md" mb={4} color={headingColor}>Profiles</Heading>
      <Button colorScheme="blue" onClick={() => handleLocalOpenModal()}>Add New Profile</Button>
      <VStack align="stretch" spacing={4} mt={4}>
        {Object.entries(groupedProfiles).map(([relationship, profiles]) => (
          <Box key={relationship}>
            <Heading size="sm" mb={2} color={relationshipColor}>{relationship}</Heading>
            <List spacing={2}>
              {profiles.map(profile => (
                <ListItem
                  key={profile.id}
                  p={2}
                  _hover={{ bg: hoverBgColor }}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => onSelectProfile(profile.id)}
                  bg={listItemBgColor}
                >
                  <VStack spacing={1} align="center">
                    <Image
                      boxSize="50px"
                      borderRadius="full"
                      src={profile.imageUrl || 'default-profile-pic.png'}
                      alt={`${profile.name}'s thumbnail`}
                    />
                    <Text color={nameColor}>{profile.name}</Text>
                  </VStack>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent bg={modalBgColor}>
          <ModalHeader color={modalHeaderColor}>{isEditing ? 'Edit Profile' : 'Create Profile'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel color={formLabelColor}>Name</FormLabel>
              <Input value={currentProfile.name} onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Relationship</FormLabel>
              <Input value={currentProfile.relationship} onChange={(e) => setCurrentProfile({ ...currentProfile, relationship: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Birthday</FormLabel>
              <Input value={currentProfile.birthday} onChange={(e) => setCurrentProfile({ ...currentProfile, birthday: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Likes</FormLabel>
              <Input value={currentProfile.likes} onChange={(e) => setCurrentProfile({ ...currentProfile, likes: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Dislikes</FormLabel>
              <Input value={currentProfile.dislikes} onChange={(e) => setCurrentProfile({ ...currentProfile, dislikes: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Favorite Food</FormLabel>
              <Input value={currentProfile.favoriteFood} onChange={(e) => setCurrentProfile({ ...currentProfile, favoriteFood: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Favorite Movie</FormLabel>
              <Input value={currentProfile.favoriteMovie} onChange={(e) => setCurrentProfile({ ...currentProfile, favoriteMovie: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Hobbies</FormLabel>
              <Input value={currentProfile.hobbies} onChange={(e) => setCurrentProfile({ ...currentProfile, hobbies: e.target.value })} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel color={formLabelColor}>Profile Picture</FormLabel>
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const imageUrl = URL.createObjectURL(file);
                  setCurrentProfile({ ...currentProfile, imageUrl });
                }
              }} bg={inputBgColor} color={inputTextColor} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveProfile}>
              Save
            </Button>
            <Button variant="ghost" onClick={handleCloseModal} color={cancelButtonColor}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProfileList;
