import React from 'react';
import { Box, Heading } from "@chakra-ui/react";

const Header = () => {
  return (
    <Box as="header" width="100%" py={4} bg="gray.100">
      <Heading as="h1" size="xl" color="gray.700">
        Besti-ez
      </Heading>
    </Box>
  );
};

export default Header;
