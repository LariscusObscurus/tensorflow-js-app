import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import ImageList from './ImageList';
import './App.css';
import { layers } from '@tensorflow/tfjs';
import { IDetectedImage } from './IDetectedImage';
import { INTERVAL, WINDOW_SIZE } from './Constants';
import { VideoView } from './components/VideoView';

interface IAppState {
  pics: IDetectedImage[];
  previewEnlarged: boolean;
}

// TODO refactor :P
class App extends Component<any, IAppState> {
  canvas = React.createRef<HTMLCanvasElement>();
  model!: cocoSsd.ObjectDetection;

  lastTimestamp = 0;
  currentPredictionsIdx = 0;
  objects = new Map<string, string>();

  state = {
    pics: new Array<IDetectedImage>(),
    previewEnlarged: false,
  };

  async componentDidMount() {
    this.model = await cocoSsd.load();
    console.log('Model loaded.');
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
    if (!this.canvas.current) throw new Error('CanvasRef is null.');

    this.canvas.current.width = video.videoWidth;
    this.canvas.current.height = video.videoHeight;

    const ctx = this.canvas.current.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context.');
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = '16px sans-serif';
    ctx.font = font;

    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox;
      const label = `${prediction.class} (${Math.round(
        prediction.score * 100
      )}%)`;

      //Bounding Box
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
      <div>
        <VideoView onFrame={this.detectFrame.bind(this)} interval={INTERVAL} />
        <canvas className="size" ref={this.canvas} />
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

export default App;
