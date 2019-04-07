import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { Theme, Paper, Typography, Button } from '@material-ui/core';
import { checkSheet } from '../CssUtil';
import { imag } from '@tensorflow/tfjs';

const styles = (theme: Theme) => {
  return checkSheet({
    paper: {
      display: 'inline-block'
    }
  });
};

type FrameHandler = (
  frame: HTMLVideoElement,
  elapsed: number
) => void | Promise<void>;

interface IDrawingViewState { 
  prediction: string;
}

interface IDrawingViewProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
  WithStyles<typeof styles, true> {
  width: number;
  height: number;
}

interface IPosition {
  offsetX: number;
  offsetY: number;
  drag: boolean;
}

class DrawingView extends Component<IDrawingViewProps, IDrawingViewState> {
  state: IDrawingViewState = {prediction: "-"};

  canvas = React.createRef<HTMLCanvasElement>();
  ctx: CanvasRenderingContext2D | null = null;

  isPainting = false;
  lines: IPosition[] = []
  

  async componentDidMount() {
    if (!this.canvas.current) return;
    this.ctx = this.canvas.current.getContext('2d');
  }

  componentDidUpdate() { }

  startPainting({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.isPainting = true;
    const { offsetX, offsetY } = nativeEvent;
    this.addPosition(offsetX, offsetY);
  }

  onMouseMove({
    nativeEvent,
  }: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!this.isPainting) return;
    const { offsetX, offsetY } = nativeEvent;
    this.addPosition(offsetX, offsetY, true);
    this.paint();
  }

  stopPainting() {
    this.isPainting = false;
  }

  async createImage(): Promise<any> {
    if (!this.canvas.current) return;
    if (!this.ctx) return;

    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = 28;
    resizeCanvas.height= 28;
    const resizeCanvasCtx =  resizeCanvas.getContext('2d');
    if (!resizeCanvasCtx) return;

    resizeCanvasCtx.drawImage(this.canvas.current, 0, 0, this.props.width, this.props.height, 0, 0, 28, 28);


    const data = resizeCanvasCtx.getImageData(0, 0, 28, 28).data;

    const imageArr = [];
    for (let i = 3; i < data.length; i += 4) {
        imageArr.push(data[i] / 255) ;
    }

    let postData = JSON.stringify({data: [imageArr]});
    let url = "https://mal2-api.azure-api.net/mnist/score"

    fetch(url, {
       method: "POST", // *GET, POST, PUT, DELETE, etc.
       mode: "cors", // no-cors, cors, *same-origin
       cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
       credentials: "same-origin", // include, *same-origin, omit
       headers: {
           "Content-Type": "application/json",
       },
       redirect: "follow", // manual, *follow, error
       referrer: "no-referrer", // no-referrer, *client
       body: postData, // body data type must match "Content-Type" header
    })
    .then((response) => {
        return response.json();
    })
    .then((myJson) => {
      this.setState({prediction: myJson[0]});
    });     
  }

  addPosition(offsetX: number, offsetY: number, drag: boolean = false) {
    this.lines.push({
      offsetX,
      offsetY,
      drag
    });
  }

  clearImage() {
    this.lines = [];
    this.setState({prediction: "-"});
    this.paint();
  }

  paint() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.props.width, this.props.height);

    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 60;
    this.ctx.strokeStyle = "#010101"

    for(let i=0; i < this.lines.length; i++) {		
      this.ctx.beginPath();
      const previous = this.lines[i - 1];
      const current  = this.lines[i];

      if(current.drag){
        this.ctx.moveTo(previous.offsetX, previous.offsetY); 
      }else{
        // Make short line for a point
        this.ctx.moveTo(current.offsetX - 1, current.offsetY); 
      }
      this. ctx.lineTo(current.offsetX, current.offsetY);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }


  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Paper className={classes.paper}>
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
        </Paper>
        <Button onClick={this.createImage.bind(this)}>Predict</Button>
        <Button onClick={this.clearImage.bind(this)}>Clear</Button>
        <Typography variant="h6" color="inherit" noWrap>
          Predicted number: {this.state.prediction}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withStyles(styles, { withTheme: true })(DrawingView);
