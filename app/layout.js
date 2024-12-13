'use client';

import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from '@clerk/nextjs';
import { Toolbar, Typography, Button } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './globals.css';

// Create a theme instance
const theme = createTheme({
  // You can customize your theme here
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <main>
              <Toolbar>
                <Typography variant='h6' sx={{ flexGrow: 1 }}>
                  
                </Typography>
                <SignedOut>
                  <Button color='inherit' href='/sign-in'>
                    Login
                  </Button>
                  <Button color='inherit' href='/sign-up'>
                    Sign Up
                  </Button>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/"/>
                </SignedIn>
              </Toolbar>
              {children}
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}