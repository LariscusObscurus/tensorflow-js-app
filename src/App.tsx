import React, { Component } from "react";
import "./App.css";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs"

class App extends Component {
  video = React.createRef<HTMLVideoElement>();
  canvas = React.createRef<HTMLCanvasElement>();

  async componentDidMount() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: "user"
                }
            });

            if (!this.video.current) {
                throw new Error("VideoRef is null.");
            }
            this.video.current.srcObject = stream;

            await new Promise((resolve, reject) => {
                if (this.video.current) {
                    this.video.current.onloadedmetadata = () => {
                        resolve();
                    };
                }
            });

            const model = await cocoSsd.load();

            await this.detectFrame(this.video.current, model);
        } catch (err) {
            console.error(err.message); // TODO inform user
        }
    }
  }

  async detectFrame(video: HTMLVideoElement, model: cocoSsd.ObjectDetection) {
    const predictions = await model.detect(video);
    this.renderPredictions(predictions);
    requestAnimationFrame(() => {
      this.detectFrame(video, model);
    });
  }

  renderPredictions(predictions: cocoSsd.DetectedObject[]) {
    if (!this.canvas.current) throw new Error("CanvasRef is null.");

    const ctx = this.canvas.current.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context.");
    }
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "16px sans-serif";
    ctx.font = font;

    for (const prediction of predictions) {
      const [x, y, width, height] = prediction.bbox;
      const label = `${prediction.class} (${Math.round(prediction.score*100)}%)`;

      //Bounding Box
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);

      //Label
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(label).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);

      //Text
      ctx.fillStyle = "#000000";
      ctx.fillText(label, x, y);
    }
  }

  render() {
    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={this.video}
          width="600"
          height="500"
        />
        <canvas className="size" ref={this.canvas} width="600" height="500" />
      </div>
    );
  }
}

export default App;
