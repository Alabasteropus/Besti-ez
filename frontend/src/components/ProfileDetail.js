import React, { useState, useEffect } from 'react';
import { Box, VStack, Heading, Text, Grid, GridItem, Center, Button, useToast } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChatIcon } from "@chakra-ui/icons";
import axios from 'axios';
import config from '../config';

const ProfileDetail = ({ profile, handleOpenModal, onDeleteProfile, onUpdateProfile, sendMessage, lastMessage }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const toast = useToast();

  const updateProfileWithNewInfo = (updatedInfo) => {
    const newProfile = { ...profile, ...updatedInfo };
    onUpdateProfile(newProfile);
  };

  useEffect(() => {
    if (profile && lastMessage !== null) {
      console.log("Raw WebSocket message received:", lastMessage.data);
      try {
        const data = JSON.parse(lastMessage.data);
        console.log("Parsed WebSocket message:", JSON.stringify(data, null, 2));
        if (data.action === 'suggestion_response') {
          console.log("Received suggestion response:", data.suggestion);
          if (!suggestions.includes(data.suggestion)) {
            setSuggestions(prevSuggestions => [...prevSuggestions, data.suggestion]);
            toast({
              title: "New GPT-4o Response",
              description: data.suggestion,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          }
          if (data.updated_profile) {
            updateProfileWithNewInfo(data.updated_profile);
            toast({
              title: "Profile Updated",
              description: "The profile has been updated with new information.",
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }
        } else if (data.error) {
          console.error("Error from WebSocket:", data.error);
          toast({
            title: "Error",
            description: `An error occurred: ${data.error}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          console.warn("Unexpected WebSocket response:", JSON.stringify(data, null, 2));
          toast({
            title: "Unexpected Response",
            description: "Received an unexpected response. Please try again.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error.message);
        console.error("Raw message that caused the error:", lastMessage.data);
        toast({
          title: "Error",
          description: "Failed to process the response. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsChatting(false);
      }
    }
  }, [profile, lastMessage, toast, updateProfileWithNewInfo, suggestions]);

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

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${config.API_BASE_URL}/profiles/${profile.id}`);
      onDeleteProfile(profile.id);
      toast({
        title: "Profile deleted",
        description: `${profile.name}'s profile has been removed.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete the profile. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChatWithGPT = () => {
    setIsChatting(true);
    const message = {
      action: 'query_gpt4o',
      profile_id: profile.id,
      query: `Tell me something interesting about ${profile.name} based on their profile information.`
    };
    console.log('Sending WebSocket message:', JSON.stringify(message, null, 2));
    sendMessage(JSON.stringify(message));
    toast({
      title: "Chat initiated",
      description: "Waiting for GPT-4o response...",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

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

        {profile.random_knowledge && (
          <Box>
            <Heading size="sm">Random Knowledge</Heading>
            <Text>{profile.random_knowledge}</Text>
          </Box>
        )}

        <Box>
          <Heading size="sm">GPT-4o Suggestions</Heading>
          {suggestions.length > 0 ? (
            <VStack align="stretch" spacing={2}>
              {suggestions.map((suggestion, index) => (
                <Text key={index}>{suggestion}</Text>
              ))}
              <Button size="sm" onClick={() => setSuggestions([])}>
                Clear Suggestions
              </Button>
            </VStack>
          ) : (
            <Text color="gray.500">No suggestions yet. Chat with GPT-4o to get some!</Text>
          )}
        </Box>

        <Button leftIcon={<EditIcon />} colorScheme="blue" onClick={() => handleOpenModal(profile)}>
          Edit Profile
        </Button>
        <Button leftIcon={<ChatIcon />} colorScheme="teal" onClick={handleChatWithGPT} isLoading={isChatting}>
          Chat with GPT-4o
        </Button>
        <Button leftIcon={<DeleteIcon />} colorScheme="red" onClick={handleDeleteProfile} isLoading={isDeleting}>
          Delete Profile
        </Button>
      </VStack>
    </Box>
  );
};

export default ProfileDetail;
