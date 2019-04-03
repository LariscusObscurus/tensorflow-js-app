import React from 'react';
import { CssBaseline, createMuiTheme } from '@material-ui/core';
import { purple, green } from '@material-ui/core/colors';
import { ThemeProvider } from '@material-ui/styles';

const theme = createMuiTheme();

export function withRoot<P>(Component: React.ComponentType<P>) {
  function WithRoot(props: P) {
    // MuiThemeProvider makes the theme available down the React tree
    // thanks to React context.
    return (
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <Component {...props} />
      </ThemeProvider>
    );
  }

  return WithRoot;
}
