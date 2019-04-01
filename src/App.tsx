import React, { Component } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';
import ImageList from './ImageList';
import './App.css';
import { layers } from '@tensorflow/tfjs';
import { IDetectedImage } from './IDetectedImage';

const TARGET_FPS = 10;
const INTERVAL = 1000 / TARGET_FPS;
const WINDOW_SIZE = 5 * TARGET_FPS;

interface IAppState {
  pics: IDetectedImage[];
  previewEnlarged: boolean;
}

// TODO refactor :P
class App extends Component<any, IAppState> {
  video = React.createRef<HTMLVideoElement>();
  canvas = React.createRef<HTMLCanvasElement>();

  lastTimestamp = 0;
  currentPredictionsIdx = 0;
  objects = new Map<string, string>();

  state = {
    pics: new Array<IDetectedImage>(),
    previewEnlarged: false,
  };

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: 'environment',
          },
        });

        if (!this.video.current) {
          throw new Error('VideoRef is null.');
        }
        this.video.current.srcObject = stream;

        await new Promise((resolve, reject) => {
          if (!this.video.current) {
            return;
          }
          this.video.current.onloadedmetadata = () => {
            if (!this.video.current || !this.canvas.current) {
              return;
            }
            this.video.current.setAttribute(
              'width',
              '' + this.video.current.offsetWidth
            );
            this.video.current.setAttribute(
              'height',
              '' + this.video.current.offsetHeight
            );
            this.canvas.current.setAttribute(
              'width',
              '' + this.video.current.offsetWidth
            );
            this.canvas.current.setAttribute(
              'height',
              '' + this.video.current.offsetHeight
            );
            resolve();
          };
        });

        const model = await cocoSsd.load();

        this.lastTimestamp = Date.now();
        await this.detectFrame(this.video.current, model);
      } catch (err) {
        console.error(err.message); // TODO inform user
      }
    }
  }

  async detectFrame(video: HTMLVideoElement, model: cocoSsd.ObjectDetection) {
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - this.lastTimestamp;

    if (elapsed > INTERVAL) {
      // adjust to target FPS (source: https://stackoverflow.com/a/19772220)
      this.lastTimestamp = currentTimestamp - (elapsed % INTERVAL);
      const predictions = await model.detect(video);
      this.renderPredictions(predictions);
      this.updateCurrentPredictions(predictions);
    }

    requestAnimationFrame(() => {
      this.detectFrame(video, model);
    });
  }

  renderPredictions(predictions: cocoSsd.DetectedObject[]) {
    if (!this.canvas.current) throw new Error('CanvasRef is null.');

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

  updateCurrentPredictions(predictions: cocoSsd.DetectedObject[]) {
    predictions.forEach(pred => {
      if (!this.objects.has(pred.class) && this.video.current) {
        let [x, y, width, height] = pred.bbox;
        const snippet = document.createElement('canvas');
        const ctx = snippet.getContext('2d');
        if (ctx) {
          if (!this.video.current) return;

          x = Math.max(0, x);
          y = Math.max(0, y);

          if (width + x > this.video.current.width - x) {
            width = this.video.current.width - x;
          }

          if (height + y > this.video.current.height - y) {
            height = this.video.current.height - y;
          }

          snippet.width = width;
          snippet.height = height;

          ctx.drawImage(
            this.video.current,
            x,
            y,
            width,
            height,
            0,
            0,
            width,
            height
          );
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
        <video className="size" autoPlay playsInline muted ref={this.video} />
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
