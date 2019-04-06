import React, { Component, ReactNode } from 'react';
import HomeIcon from '@material-ui/icons/Home';
import CameraIcon from '@material-ui/icons/CameraAlt';
import CallSplitIcon from '@material-ui/icons/CallSplit';
import './App.css';
import ObjectDetectorView from './components/ObjectDetectorView';
import AppShell, { IMenuEntry } from './components/AppShell';
import { withRoot } from './Theme';
import { WelcomePage } from './components/WelcomePage';
import KnnTest from './components/KnnTest';
import DrawingView from './components/DrawingView';

interface IAppProps {}

interface IAppState {
  menuEntries: IMenuEntry[];
  activePage: ReactNode;
}

class App extends Component<IAppProps, IAppState> {
  state: IAppState = {
    menuEntries: [
      {
        title: 'Welcome',
        icon: HomeIcon,
        action: () =>
          this.setState({
            activePage: this.showWelcomePage(),
          }),
      },
      {
        title: 'ObjectDetection',
        icon: CameraIcon,
        action: () =>
          this.setState({
            activePage: this.showObjectDection(),
          }),
      },
      {
        title: 'KnnDingens',
        icon: CallSplitIcon,
        action: () =>
          this.setState({
            activePage: this.showKNNDection(),
          }),
      },
      {
        title: 'Draw',
        icon: CallSplitIcon,
        action: () =>
          this.setState({
            activePage: this.showDrawingView(),
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

  showKNNDection() {
    return <KnnTest />;
  }

  showDrawingView() {
    return <DrawingView width={500} height={500} />;
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
