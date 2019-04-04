import React, { Component, createRef } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { IDetectedImage } from '../IDetectedImage';
import { BoundingBox, CanvasView } from './CanvasView';
import { WINDOW_SIZE, INTERVAL } from '../Constants';
import ImageList from './ImageList';
import { Paper, Theme, CircularProgress } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/styles';
import { VideoView } from './VideoView';
import classNames from 'classnames';
import { checkSheet } from '../CssUtil';
import { inherits } from 'util';
import {knn} from 'ml-knn';

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
    },
    covered: {
      width: 'inherit',
    },
    covering: {
      width: 'inherit',
      position: 'absolute',
      top: '0px',
      left: '0px',
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
      padding: 20,
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
  modelMobilenet!: mobilenet.MobileNet;

  currentPredictionsIdx = 0;
  objects = new Map<string, string>();

  state: IObjectDetectorViewState = {
    pics: new Array<IDetectedImage>(),
    previewEnlarged: false,
    boundingBoxes: new Array<BoundingBox>(),
    videoSize: { width: 640, height: 480 },
    loading: true,
  };

  async componentDidMount() {
    this.showLoadingIndicator();
    this.model = await cocoSsd.load();
    this.modelMobilenet = await mobilenet.load();
    this.hideLoadingIndicator();
    console.log('Model loaded.');
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

  private videoRef = createRef<VideoView>()

  addObjectKnn() {

    const vid = this.videoRef.current!.video.current!;
    const activations = this.modelMobilenet.infer(vid);
    // knn add 

    alert("obj");
  }

  addEnvironmentKnn() {
    alert("environ");
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.layout}>
        <Paper className={classes.paper}>
          <div className={classes.insideWrapper}>
            <VideoView
              ref={this.videoRef}
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
        </Paper>

        <div>
          <button onClick={this.addObjectKnn.bind(this)}>
          Add Object KNN
          </button>
          <button onClick={this.addEnvironmentKnn}>
          Add Environment KNN
          </button>
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
