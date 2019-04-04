import React, { Component } from 'react';
import { Typography } from '@material-ui/core';

interface WelcomePageProps {}

export class WelcomePage extends Component<WelcomePageProps> {
  render() {
    return (
      <Typography variant="h6" color="inherit" noWrap>
        Welcome to our Application.
      </Typography>
    );
  }
}
