import React from 'react';
import './ImageList.css';
import { IDetectedImage } from './IDetectedImage';

interface IImageListProps {
  pics: IDetectedImage[];
}

export default function(props: IImageListProps) {
  return (
    <ul className="image-list">
      {props.pics.map(({ data }: IDetectedImage) => (
        <li className="image-list__item">
          <img className="image-list__image" src={data} />
        </li>
      ))}
    </ul>
  );
}
