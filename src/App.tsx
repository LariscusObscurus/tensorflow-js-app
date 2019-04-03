import React, { Component } from 'react';
import './App.css';
import { createStyles, withStyles, WithStyles } from '@material-ui/styles';
import ObjectDetectorView from './components/ObjectDetectorView';

const appStyles = createStyles({});

interface IAppProps extends WithStyles<typeof appStyles> {}

interface IAppState {}

class App extends Component<IAppProps, IAppState> {
  render() {
    return <ObjectDetectorView />;
  }
}

export default withStyles(appStyles)(App);
