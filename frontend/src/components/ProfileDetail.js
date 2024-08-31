import React from 'react';
import { Box, VStack, Heading, Text, Grid, GridItem, Center, Button } from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";

const ProfileDetail = ({ profile, handleOpenModal }) => {
  if (!profile) {
    return (
      <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white" height="100%">
        <Center height="100%">
          <Text color="gray.500">Select a profile to view details</Text>
        </Center>
      </Box>
    );
  }

  const likes = Array.isArray(profile.likes) ? profile.likes : [];
  const dislikes = Array.isArray(profile.dislikes) ? profile.dislikes : [];
  const hobbies = Array.isArray(profile.hobbies) ? profile.hobbies : [];

  return (
    <Box borderWidth={1} borderRadius="lg" p={4} boxShadow="md" bg="white">
      <VStack align="stretch" spacing={2}>
        <VStack spacing={1} align="center">
          <Heading size="lg">{profile.name}</Heading>
          <Text fontSize="md" color="gray.500">{profile.relationship}</Text>
        </VStack>

        <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem>
            <Heading size="sm">Birthday</Heading>
            <Text>{profile.birthday}</Text>
          </GridItem>
          <GridItem>
            <Heading size="sm">Favorite Food</Heading>
            <Text>{profile.favoriteFood}</Text>
          </GridItem>
          <GridItem>
            <Heading size="sm">Favorite Movie</Heading>
            <Text>{profile.favoriteMovie}</Text>
          </GridItem>
        </Grid>

        <Box>
          <Heading size="sm">Likes</Heading>
          <Text>{likes.join(", ")}</Text>
        </Box>

        <Box>
          <Heading size="sm">Dislikes</Heading>
          <Text>{dislikes.join(", ")}</Text>
        </Box>

        <Box>
          <Heading size="sm">Hobbies</Heading>
          <Text>{hobbies.join(", ")}</Text>
        </Box>

        <Button leftIcon={<EditIcon />} colorScheme="blue" onClick={() => handleOpenModal(profile)}>
          Edit Profile
        </Button>
        <Button colorScheme="teal" onClick={handleSpeechInteraction}>
          Talk to GPT-4o
        </Button>
      </VStack>
    </Box>
  );

  function handleSpeechInteraction() {
    // Placeholder for speech-to-text and text-to-speech logic
    // This function should capture speech, send it to the GPT-4o API, and handle the response
    console.log("Speech interaction initiated");
  }
};

export default ProfileDetail;
