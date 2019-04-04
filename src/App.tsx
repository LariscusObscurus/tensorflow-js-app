import React, { Component } from 'react';
import './App.css';
import ObjectDetectorView from './components/ObjectDetectorView';
import AppShell, { IMenuEntry } from './components/AppShell';
import { withRoot } from './Theme';
import { WelcomePage } from './components/WelcomePage';

interface IAppProps {}

interface IAppState {
  menuEntries: IMenuEntry[];
  activePage: JSX.Element;
}

class App extends Component<IAppProps, IAppState> {
  state: IAppState = {
    menuEntries: [
      {
        title: 'Welcome',
        action: () =>
          this.setState({
            activePage: this.showWelcomePage(),
          }),
      },
      {
        title: 'ObjectDetection',
        action: () =>
          this.setState({
            activePage: this.showObjectDection(),
          }),
      },
    ],
    activePage: this.showWelcomePage(),
  };

  showWelcomePage() {
    return <WelcomePage />;
  }

  showObjectDection() {
    return <ObjectDetectorView />;
  }

  render() {
    return (
      <React.Fragment>
        <AppShell menuEntries={this.state.menuEntries}>
          {this.state.activePage}
        </AppShell>
      </React.Fragment>
    );
  }
}

export default withRoot(App);
