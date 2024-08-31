import React from 'react';
import { Box, Heading, useColorModeValue } from "@chakra-ui/react";

const Header = () => {
  const bgColor = useColorModeValue("gray.800", "gray.900");
  const textColor = useColorModeValue("gray.100", "gray.50");

  return (
    <Box as="header" width="100%" py={4} bg={bgColor}>
      <Heading as="h1" size="xl" color={textColor}>
        Besti-ez
      </Heading>
    </Box>
  );
};

export default Header;
