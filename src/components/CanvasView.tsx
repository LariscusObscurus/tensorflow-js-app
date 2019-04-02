import { Component } from 'react';
import React from 'react';
import { heUniform } from '@tensorflow/tfjs-layers/dist/exports_initializers';

export type BoundingBox = {
  label: string;
  dimensions: [number, number, number, number];
};

interface ICanvasViewState {
  boundingBoxes: BoundingBox[];
}

interface ICanvasViewProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  boundingBoxes: BoundingBox[];
  width?: number;
  height?: number;
}

export class CanvasView extends Component<ICanvasViewProps, ICanvasViewState> {
  canvas = React.createRef<HTMLCanvasElement>();
  state: ICanvasViewState = { boundingBoxes: [] };

  constructor(props: ICanvasViewProps) {
    super(props);
  }

  componentWillReceiveProps(nextProps: ICanvasViewProps) {
    this.setState({ boundingBoxes: nextProps.boundingBoxes });
    this.drawBoundingBoxes();
  }

  drawBoundingBoxes() {
    if (!this.canvas.current) throw new Error('CanvasRef is null.');
    const ctx = this.canvas.current.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context.');
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = '16px sans-serif';
    ctx.font = font;

    for (const boundingBox of this.state.boundingBoxes) {
      const [x, y, width, height] = boundingBox.dimensions;
      const label = boundingBox.label;

      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      //Label
      ctx.fillStyle = '#00FFFF';
      const textWidth = ctx.measureText(label).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      //Text
      ctx.fillStyle = '#000000';
      ctx.fillText(label, x, y);
    }
  }

  render() {
    return (
      <canvas
        className="size"
        ref={this.canvas}
        width={this.props.width}
        height={this.props.height}
      />
    );
  }
}
