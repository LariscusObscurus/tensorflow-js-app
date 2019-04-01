import React from 'react';
import './ImageList.css';
import { IDetectedImage } from './IDetectedImage';

interface IImageListProps {
  pics: IDetectedImage[];
}

export default function(props: IImageListProps) {
  return (
    <ul className="image-list">
      {props.pics.map((detectedImage: IDetectedImage) => (
        <li className="image-list__item" key={detectedImage.key}>
          <img className="image-list__image" src={detectedImage.data} />
        </li>
      ))}
    </ul>
  );
}
