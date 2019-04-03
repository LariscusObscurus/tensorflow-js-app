import React, { Component } from 'react';
import './App.css';
import ObjectDetectorView from './components/ObjectDetectorView';
import AppShell from './components/AppShell';
import { withRoot } from './Theme';

interface IAppProps {}

interface IAppState {}

class App extends Component<IAppProps, IAppState> {
  render() {
    return (
      <React.Fragment>
        <AppShell>
          <ObjectDetectorView />;
        </AppShell>
      </React.Fragment>
    );
  }
}

export default withRoot(App);
