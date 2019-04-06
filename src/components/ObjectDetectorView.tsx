import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { IDetectedImage } from '../IDetectedImage';
import { BoundingBox, CanvasView } from './CanvasView';
import { INTERVAL, WINDOW_SIZE } from '../Constants';
import ImageList from './ImageList';
import { BottomNavigation, CircularProgress, Theme, BottomNavigationAction } from '@material-ui/core';
import { withStyles, WithStyles } from '@material-ui/styles';
import CameraIcon from '@material-ui/icons/CameraAlt';
import ImageListIcon from '@material-ui/icons/PhotoAlbum';
import { VideoView } from './VideoView';
import classNames from 'classnames';
import { checkSheet } from '../CssUtil';
import fetchDetails from '../fetchDetails';

const objectDetectorStyles = (theme: Theme) => {
  return checkSheet({
    progress: {
      margin: theme.spacing.unit * 2,
    },
    hide: {
      display: 'none',
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
    layout: {
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    bottomNavigation: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100vw'
    }
  });
};

interface IObjectDetectorViewState {
  pics: IDetectedImage[];
  activeView: number;
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
    activeView: 0,
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

  resolveDetails(img: IDetectedImage, idx: number) {
    fetchDetails(img).then(imgWithDetails => {
      const pics = [...this.state.pics];
      const item = { ...pics[idx] };
      item.details = imgWithDetails.details;
      pics[idx] = item;
      this.setState({ pics });
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <div
          className={classNames(classes.layout, {
            [classes.hide]: this.state.activeView !== 0
          })}
        >
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
        </div>

        <div className={classNames(classes.insideWrapper, {
          [classes.hide]: this.state.activeView !== 1
        })}>
          <ImageList
            pics={this.state.pics}
            onSelectImage={(img, idx) => this.resolveDetails(img, idx)}
          />
        </div>

        <BottomNavigation
          className={classes.bottomNavigation}
          value={this.state.activeView}
          onChange={(ev, value) => this.setState({ activeView: value })}
        >
          <BottomNavigationAction label="Camera" icon={<CameraIcon/>} />
          <BottomNavigationAction label="Gallery" icon={<ImageListIcon/>} />
        </BottomNavigation>
      </React.Fragment>
    );
  }
}
export default withStyles(objectDetectorStyles, { withTheme: true })(
  ObjectDetectorView
);
