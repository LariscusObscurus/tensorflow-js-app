import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Theme,
  Toolbar,
  Typography,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import classNames from 'classnames';

const drawerWidth = 240;

const styles = (theme: Theme) => {
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
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      ...theme.mixins.toolbar,
      justifyContent: 'flex-end',
    },
    content: {
      marginTop: theme.spacing.unit * 8,
      flexGrow: 1,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
  };
};
export interface IMenuEntry {
  title: string;
  icon: React.ComponentType;
  action: () => void;
}

interface IAppShellState {
  drawerOpen: boolean;
}

interface IAppShellProps extends WithStyles<typeof styles, true> {
  menuEntries: IMenuEntry[];
}

class AppShell extends Component<IAppShellProps, IAppShellState> {
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
    const { classes, children, theme, menuEntries } = this.props;
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
            <div className={classes.drawerHeader}>
              <IconButton onClick={this.closeDrawer.bind(this)}>
                {theme.direction === 'ltr' ? (
                  <ChevronLeftIcon />
                ) : (
                  <ChevronRightIcon />
                )}
              </IconButton>
            </div>
            <Divider />
            <List>
              {menuEntries.map((entry, index) => (
                <ListItem button key={entry.title} onClick={entry.action}>
                  <ListItemIcon>
                    <entry.icon/>
                  </ListItemIcon>
                  <ListItemText primary={entry.title} />
                </ListItem>
              ))}
            </List>
          </Drawer>
          <main
            className={classNames(classes.content, {
              [classes.contentShift]: drawerOpen,
            })}
          >
            {children}
          </main>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AppShell);
