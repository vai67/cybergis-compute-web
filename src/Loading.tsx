import { useEffect, useState } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';

function Loading() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      height="100vh"
      width="100vw"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      bg="gray.50"
      textAlign="center"
    >
      <VStack spacing={2}>
        <Text fontSize="2xl" color="blue.500" fontWeight="bold">
          Loading{dots}
        </Text>
        <Text fontSize="sm" color="gray.500">
          Please wait while we fetch your data!
        </Text>
      </VStack>
    </Box>
  );
}

export default Loading;
