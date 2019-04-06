import React from 'react';
import { GridList, GridListTile, GridListTileBar } from '@material-ui/core';
import { IDetectedImage } from '../IDetectedImage';

interface IImageListProps {
  pics: IDetectedImage[];
}

export default (props: IImageListProps) =>
  <GridList>
    {props.pics.map((detectedImage: IDetectedImage) =>
      <GridListTile key={detectedImage.key}>
        <img src={detectedImage.data} alt={detectedImage.label}/>
        <GridListTileBar
          title={detectedImage.label}
          subtitle=""
        />
      </GridListTile>,
    )}
  </GridList>
