import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { IDetectedImage } from '../IDetectedImage';
import { BoundingBox, CanvasView } from './CanvasView';
import { INTERVAL, WINDOW_SIZE } from '../Constants';
import ImageList from './ImageList';
import { CircularProgress, Theme } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/styles';
import { VideoView } from './VideoView';
import classNames from 'classnames';
import { checkSheet } from '../CssUtil';

const objectDetectorStyles = (theme: Theme) => {
  return checkSheet({
    progress: {
      margin: theme.spacing.unit * 2,
    },
    hide: {
      display: 'none',
    },
    outsideWrapper: {
      backgroundColor: 'white',
      width: '100%',
      height: '100%',
    },
    insideWrapper: {
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '100vw'
    },
    covered: {
    },
    covering: {
      position: 'absolute',
      top: '0',
      left: '0',
    },
    videoCanvasView: {
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
    layout: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    paper: {
      marginTop: '40px',
    },
  });
};

interface IObjectDetectorViewState {
  pics: IDetectedImage[];
  previewEnlarged: boolean;
  boundingBoxes: BoundingBox[];
  videoSize: { width: number; height: number };
  loading: boolean;
}

interface IObjectDetectorViewProps
  extends React.HtmlHTMLAttributes<HTMLDivElement>,
    WithStyles<typeof objectDetectorStyles, true> {}

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
    videoSize: { width: window.innerWidth, height: window.innerHeight },
    loading: true,
  };

  async componentDidMount() {
    if (!this.model) {
      this.showLoadingIndicator();
      this.model = await cocoSsd.load();
      console.log('Model loaded.');
      this.hideLoadingIndicator();
    }
  }

  showLoadingIndicator() {
    this.setState({
      loading: true,
    });
  }

  hideLoadingIndicator() {
    this.setState({
      loading: false,
    });
  }

  videoViewReady(width: number, height: number) {
    this.setState(() => ({
      videoSize: { width, height },
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
    const { classes } = this.props;
    return (
      <div className={classes.layout}>

        <div className={classes.insideWrapper}>
          <VideoView
            className={classes.covered}
            onFrame={this.detectFrame.bind(this)}
            onInit={this.videoViewReady.bind(this)}
            interval={INTERVAL}
          />
          <CanvasView
            className={classes.covering}
            boundingBoxes={this.state.boundingBoxes}
            width={this.state.videoSize.width}
            height={this.state.videoSize.height}
          />
          <CircularProgress
            className={classNames(classes.progress, {
              [classes.hide]: !this.state.loading,
            })}
          />
        </div>

        <div
          className={classNames(classes.bar, {
            [classes.isEnlarged]: this.state.previewEnlarged,
          })}
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
export default withStyles(objectDetectorStyles, { withTheme: true })(
  ObjectDetectorView
);
