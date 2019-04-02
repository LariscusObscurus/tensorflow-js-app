import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import ImageList from './components/ImageList';
import './App.css';
import { layers } from '@tensorflow/tfjs';
import { IDetectedImage } from './IDetectedImage';
import { INTERVAL, WINDOW_SIZE } from './Constants';
import { VideoView } from './components/VideoView';
import { CanvasView, BoundingBox } from './components/CanvasView';
import Paper from '@material-ui/core/Paper';
import { createStyles, withStyles } from '@material-ui/styles';
/*
.outsideWrapper{ 
    width:256px; height:256px; 
    margin:20px 60px; 
    border:1px solid blue;}
.insideWrapper{ 
    width:100%; height:100%; 
    position:relative;}
.coveredImage{ 
    width:100%; height:100%; 
    position:absolute; top:0px; left:0px;
}
.coveringCanvas{ 
    width:100%; height:100%; 
    position:absolute; top:0px; left:0px;
    background-color: rgba(255,0,0,.1);
}*/

const appStyles = createStyles({
  outsideWrapper: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  insideWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  covered: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
  covering: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: '0px',
    left: '0px',
  },
  videoCanvasView: {
    width: '50%',
    height: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
});

interface IAppState {
  pics: IDetectedImage[];
  previewEnlarged: boolean;
  boundingBoxes: BoundingBox[];
  videoSize: { width: number; height: number };
}

// TODO refactor :P
class App extends Component<any, IAppState> {
  model!: cocoSsd.ObjectDetection;

  currentPredictionsIdx = 0;
  objects = new Map<string, string>();

  state: IAppState = {
    pics: new Array<IDetectedImage>(),
    previewEnlarged: false,
    boundingBoxes: new Array<BoundingBox>(),
    videoSize: { width: 640, height: 480 },
  };

  async componentDidMount() {
    this.model = await cocoSsd.load();
    console.log('Model loaded.');
  }

  videoViewReady(width: number, height: number) {
    this.setState((state: IAppState) => ({
      videoSize: { width: width, height: height },
    }));
  }

  async detectFrame(video: HTMLVideoElement, elapsed: number) {
    if (!this.model) return;

    const predictions = await this.model.detect(video);
    this.renderPredictions(predictions, video);
    this.updateCurrentPredictions(predictions, video);
  }

  renderPredictions(
    predictions: cocoSsd.DetectedObject[],
    video: HTMLVideoElement
  ) {
    this.setState((state: IAppState) => ({
      boundingBoxes: predictions.map(
        prediction =>
          ({
            dimensions: prediction.bbox,
            label: `${prediction.class} (${Math.round(
              prediction.score * 100
            )}%)`,
          } as BoundingBox)
      ),
    }));
  }

  updateCurrentPredictions(
    predictions: cocoSsd.DetectedObject[],
    video: HTMLVideoElement
  ) {
    predictions.forEach(pred => {
      if (!this.objects.has(pred.class) && video) {
        let [x, y, width, height] = pred.bbox;
        const snippet = document.createElement('canvas');
        const ctx = snippet.getContext('2d');
        if (ctx) {
          x = Math.max(0, x);
          y = Math.max(0, y);

          if (width + x > video.width - x) {
            width = video.width - x;
          }

          if (height + y > video.height - y) {
            height = video.height - y;
          }

          snippet.width = width;
          snippet.height = height;

          ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
          const imageData = snippet.toDataURL('image/png');
          this.objects.set(pred.class, imageData);
        }
      }
    });

    this.currentPredictionsIdx++;

    if (!(this.currentPredictionsIdx > WINDOW_SIZE)) {
      return;
    }

    this.currentPredictionsIdx = 0;
    let storeObjs: Array<IDetectedImage> = [];
    // const storageItem = localStorage.getItem('objects');
    // if (storageItem !== null) {
    //     storeObjs = JSON.parse(storageItem);
    // }
    this.objects.forEach((data, label) => {
      const lastEntry = this.state.pics[this.state.pics.length - 1];
      if (layers)
        storeObjs.push({
          data: data,
          label: label,
          key: Math.random(),
        });
    });
    this.setState((state: IAppState) => ({
      pics: [...state.pics, ...storeObjs],
    }));
    // localStorage.setItem('objects', JSON.stringify(storeObjs));
    this.objects = new Map();
  }

  render() {
    return (
      <div className={this.props.classes.outsideWrapper}>
        <Paper className={this.props.classes.videoCanvasView}>
          <div className={this.props.classes.insideWrapper}>
            <VideoView
              className={this.props.classes.covered}
              onFrame={this.detectFrame.bind(this)}
              onInit={this.videoViewReady.bind(this)}
              interval={INTERVAL}
            />
            <CanvasView
              className={this.props.classes.covering}
              boundingBoxes={this.state.boundingBoxes}
              width={this.state.videoSize.width}
              height={this.state.videoSize.height}
            />
          </div>
        </Paper>
        <div
          className={`bar ${this.state.previewEnlarged ? 'is-enlarged' : ''}`}
          onClick={() =>
            this.setState((state: any) => ({
              previewEnlarged: !state.previewEnlarged,
            }))
          }
        >
          <ImageList pics={this.state.pics} />
        </div>
      </div>
    );
  }
}

export default withStyles(appStyles)(App);
