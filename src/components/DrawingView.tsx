import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { Theme } from '@material-ui/core';
import { checkSheet } from '../CssUtil';

const styles = (theme: Theme) => {
  return checkSheet({});
};

interface IDrawingViewState {}

interface IDrawingViewProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    WithStyles<typeof styles, true> {
  width: number;
  height: number;
}

interface IPosition {
  offsetX: number;
  offsetY: number;
}

class DrawingView extends Component<IDrawingViewProps, IDrawingViewState> {
  state: IDrawingViewState = {};

  canvas = React.createRef<HTMLCanvasElement>();
  context: CanvasRenderingContext2D | null = null;

  isPainting = false;
  prevPos: IPosition = { offsetX: 0, offsetY: 0 };
  line: { start: IPosition; stop: IPosition }[] = [];

  async componentDidMount() {
    if (!this.canvas.current) return;
    this.context = this.canvas.current.getContext('2d');
  }

  componentDidUpdate() {}

  startPainting({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }

  onMouseMove({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      // Set the start and stop position of the paint event.
      const positionData = {
        start: { ...this.prevPos },
        stop: { ...offSetData },
      };
      // Add the position to the line array
      this.line = this.line.concat(positionData);
      this.paint(this.prevPos, offSetData, '#000');
    }
  }

  stopPainting() {
    if (this.isPainting) {
      this.isPainting = false;
    }
  }

  paint(prevPos: IPosition, currPos: IPosition, strokeStyle: string) {
    if (!this.context) return;

    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    this.context.beginPath();
    this.context.strokeStyle = strokeStyle;
    // Move the the prevPosition of the mouse
    this.context.moveTo(x, y);
    // Draw a line to the current position of the mouse
    this.context.lineTo(offsetX, offsetY);
    // Visualize the line using the strokeStyle
    this.context.stroke();
    this.prevPos = { offsetX, offsetY };
  }

  render() {
    return (
      <canvas
        className={this.props.className}
        ref={this.canvas}
        width={this.props.width}
        height={this.props.height}
        onMouseDown={this.startPainting.bind(this)}
        onMouseUp={this.stopPainting.bind(this)}
        onMouseLeave={this.stopPainting.bind(this)}
        onMouseMove={this.onMouseMove.bind(this)}
      />
    );
  }
}

export default withStyles(styles, { withTheme: true })(DrawingView);
