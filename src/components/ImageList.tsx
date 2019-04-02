import React from 'react';
import './ImageList.css';
import { IDetectedImage } from '../IDetectedImage';
import { List, ListItem } from '@material-ui/core';
import { createStyles, makeStyles } from '@material-ui/styles';

const style = makeStyles({
  horizontalList: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
    overflow: 'auto',
  },
});

interface IImageListProps {
  pics: IDetectedImage[];
}

export default function(props: IImageListProps) {
  const classes = style();
  return (
    <List className={classes.horizontalList}>
      {props.pics.map((detectedImage: IDetectedImage) => (
        <ListItem key={detectedImage.key}>
          <img src={detectedImage.data} />
        </ListItem>
      ))}
    </List>
  );
}
