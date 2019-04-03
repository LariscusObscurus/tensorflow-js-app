import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { IDetectedImage } from '../IDetectedImage';
import { BoundingBox, CanvasView } from './CanvasView';
import { WINDOW_SIZE, INTERVAL } from '../Constants';
import ImageList from './ImageList';
import { Paper } from '@material-ui/core';
import { createStyles, withStyles, WithStyles } from '@material-ui/styles';
import { VideoView } from './VideoView';

const objectDetectorStyles = createStyles({
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
  bar: {
    position: 'fixed',
    left: 0,
    bottom: 0,
    width: '100%',
    height: '10vh',
    background: 'white',
    boxShadow: '0 0 10px 4px rgba(0, 0, 0, 0.75)',
  },
  isEnlarged: {
    height: '50vh',
  },
});

interface IObjectDetectorViewState {
  pics: IDetectedImage[];
  previewEnlarged: boolean;
  boundingBoxes: BoundingBox[];
  videoSize: { width: number; height: number };
}

interface IObjectDetectorViewProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    WithStyles<typeof objectDetectorStyles> {}

class ObjectDetectorView extends Component<
  IObjectDetectorViewProps,
  IObjectDetectorViewState
> {
  model!: cocoSsd.ObjectDetection;

  currentPredictionsIdx = 0;
  objects = new Map<string, string>();

  state: IObjectDetectorViewState = {
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
    this.setState((state: IObjectDetectorViewState) => ({
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
    this.setState((state: IObjectDetectorViewState) => ({
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
    this.objects.forEach((data, label) => {
      if (data)
        storeObjs.push({
          data: data,
          label: label,
          key: Math.random(),
        });
    });
    this.setState((state: IObjectDetectorViewState) => ({
      pics: [...state.pics, ...storeObjs],
    }));
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
          className={`${this.props.classes.bar} ${
            this.state.previewEnlarged ? this.props.classes.isEnlarged : ''
          }`}
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
export default withStyles(objectDetectorStyles)(ObjectDetectorView);
