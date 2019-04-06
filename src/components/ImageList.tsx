import React from 'react';
import { GridList, GridListTile, GridListTileBar, IconButton, Theme } from '@material-ui/core';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';
import { IDetectedImage } from '../IDetectedImage';
import { checkSheet } from '../CssUtil';
import { WithStyles } from "@material-ui/styles/withStyles";
import { withStyles } from "@material-ui/styles";

const styles = () =>
  checkSheet({
    icon: {
      color: 'white'
    }
  });

interface IImageListProps extends WithStyles<typeof styles, true> {
  pics: IDetectedImage[];
  onSelectImage: (img: IDetectedImage, idx: number) => void
}

const ImageList = (props: IImageListProps) => {
  const { classes, onSelectImage } = props;
  return <GridList>
    {props.pics.map((detectedImage: IDetectedImage, idx: number) => {
      const caption = detectedImage.details
        && detectedImage.details.description
        && detectedImage.details.description.captions
        && detectedImage.details.description.captions[0]
        && detectedImage.details.description.captions[0].text
        || detectedImage.label;
      return <GridListTile key={detectedImage.key}>
        <img src={detectedImage.data} alt={detectedImage.label}/>
        <GridListTileBar
          title={caption}
          subtitle=""
          actionIcon={
            <IconButton
              className={classes.icon}
              onClick={() => onSelectImage(detectedImage, idx)}
            >
              { detectedImage.details ? <StarIcon/> : <StarBorderIcon/> }
            </IconButton>
          }
        />
      </GridListTile>;
    })}
  </GridList>;
};

export default withStyles(styles, { withTheme: true })(
  ImageList
);
