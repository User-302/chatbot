'use client'

import { Box, Button, Stack, TextField } from '@mui/material'
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs';
import { db } from '../firebase'; // Import your Firebase config

export default function Home() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your therapist. How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // Add state for minimized status
  const messageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // ________________________FETCH CHAT HISTORY ON LOAD________________________
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!userId) {
        console.warn("User is not authenticated. Chat history won't be fetched.");
        return;
      }
  
      try {
        const response = await fetch('/api/chat/', { method: 'GET' });
        const result = await response.json();
        
  
        if (result.messages && result.messages.length > 0) {
          setMessages(result.messages);
        } else setMessages([
          {
            role: 'assistant',
            content: "Hi! I'm your therapist. How can I help you today?",
          },
        ]);
        
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
  
    fetchChatHistory();
  }, [userId]);
  
  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    const newMessages = [...messages, { role: "user", content: message }];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const result = await response.json();
      setMessages([...newMessages, { role: "assistant", content: result.content }]);
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setMessage('');
    setIsLoading(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  
  // Auto scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChatbox = () => {
    setIsMinimized(!isMinimized); // Toggle minimized state
  };


const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage(event)
  }
}

  return (
    <Box
      width="100vw"
      height="85vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="700px"
        height="500px"
        border="1px solid black"
        p={2}
        spacing={3}
        overflow="hidden" // Prevent resizing based on content
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
            >
              <Box
                bgcolor={
                  message.role === 'assistant'
                    ? 'primary.main'
                    : 'secondary.main'
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            inputRef={messageInputRef} // Add ref to text field
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

