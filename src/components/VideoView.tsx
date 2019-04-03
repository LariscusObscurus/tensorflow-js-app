import { Component } from 'react';
import React from 'react';
import { INTERVAL } from '../Constants';

type FrameHandler = (
  frame: HTMLVideoElement,
  elapsed: number
) => void | Promise<void>;

type InitHandler = (width: number, height: number) => void | Promise<void>;

interface IVideoViewState {}

interface IVideoViewProps extends React.HtmlHTMLAttributes<HTMLDivElement> {
  interval: number;
  onFrame: FrameHandler | null;
  onInit?: InitHandler | null;
}

const defaultProps = { interval: INTERVAL, onFrame: null, onInit: null };

export class VideoView extends Component<IVideoViewProps, IVideoViewState> {
  video = React.createRef<HTMLVideoElement>();
  lastTimestamp = 0;

  state = {};

  constructor(props: IVideoViewProps) {
    super(props);
  }

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
            if (!this.video.current) {
              return;
            }
            this.video.current.width = this.video.current.videoWidth;
            this.video.current.height = this.video.current.videoHeight;

            if (this.props.onInit)
              this.props.onInit(
                this.video.current.videoWidth,
                this.video.current.videoHeight
              );
            resolve();
          };
        });

        this.lastTimestamp = Date.now();
        await this.renderFrame(this.video.current);
      } catch (err) {
        console.error(err.message); // TODO inform user
      }
    }
  }

  renderFrame(current: HTMLVideoElement): any {
    if (!this.props.onFrame) return;
    const currentTimestamp = Date.now();
    const elapsed = currentTimestamp - this.lastTimestamp;

    if (elapsed > this.props.interval) {
      this.props.onFrame(current, elapsed);
    }

    requestAnimationFrame(() => {
      this.renderFrame(current);
    });
  }

  render() {
    return (
      <video
        className={this.props.className}
        autoPlay
        playsInline
        muted
        ref={this.video}
      />
    );
  }
}
