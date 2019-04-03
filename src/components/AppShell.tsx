import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class AppShell extends Component<WithStyles<typeof styles>> {
  render() {
    return (
      <React.Fragment>
        <div className={this.props.classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                className={this.props.classes.menuButton}
                color="inherit"
                aria-label="Menu"
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                color="inherit"
                className={this.props.classes.grow}
              >
                tensorflow.js for MAL2
              </Typography>
            </Toolbar>
          </AppBar>
        </div>
        {this.props.children}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(AppShell);
