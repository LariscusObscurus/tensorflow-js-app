import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Theme,
  Drawer,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import classNames from 'classnames';

const drawerWidth = 240;

const styles = (theme: Theme) => {
  console.log(theme);
  return {
    root: {
      display: 'flex',
    },
    menuButton: {
      marginLeft: 12,
      marginRight: 20,
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
  };
};

interface IAppShellState {
  drawerOpen: boolean;
}

class AppShell extends Component<WithStyles<typeof styles>, IAppShellState> {
  state: IAppShellState = {
    drawerOpen: false,
  };
  openDrawer() {
    this.setState({ drawerOpen: true });
  }
  closeDrawer() {
    this.setState({ drawerOpen: false });
  }

  render() {
    const { drawerOpen } = this.state;
    const { classes, children } = this.props;
    return (
      <React.Fragment>
        <div className={classes.root}>
          <AppBar
            position="fixed"
            className={classNames(classes.appBar, {
              [classes.appBarShift]: drawerOpen,
            })}
          >
            <Toolbar disableGutters={!drawerOpen}>
              <IconButton
                className={classNames(
                  classes.menuButton,
                  drawerOpen && classes.hide
                )}
                color="inherit"
                aria-label="Menu"
                onClick={this.openDrawer.bind(this)}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" noWrap>
                tensorflow.js for MAL2
              </Typography>
            </Toolbar>
          </AppBar>
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={drawerOpen}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <div />
          </Drawer>
        </div>
        {children}
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AppShell);
