'use client';

import { CacheProvider } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';
import createCache from '@emotion/cache';
import { theme } from '~/styles/theme';

const muiCache = createCache({ key: 'mui', prepend: true });

export default function MUIProvider({ children }: { children: ReactNode }) {
  const [cache] = useState(() => muiCache); // ensures no SSR mismatch

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
