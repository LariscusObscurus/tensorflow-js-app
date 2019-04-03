import React, { Component } from 'react';
import './App.css';
import { createStyles, withStyles, WithStyles } from '@material-ui/styles';
import ObjectDetectorView from './components/ObjectDetectorView';
import AppShell from './components/AppShell';
import { CssBaseline } from '@material-ui/core';

const appStyles = createStyles({});

interface IAppProps extends WithStyles<typeof appStyles> {}

interface IAppState {}

class App extends Component<IAppProps, IAppState> {
  render() {
    return (
      <React.Fragment>
        <CssBaseline />
        <AppShell>
          <ObjectDetectorView />;
        </AppShell>
      </React.Fragment>
    );
  }
}

export default withStyles(appStyles)(App);
