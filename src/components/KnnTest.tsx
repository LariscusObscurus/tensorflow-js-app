import React, { Component } from 'react';
import { WithStyles, withStyles } from '@material-ui/styles';
import { Theme, Button, Typography } from '@material-ui/core';
import { checkSheet } from '../CssUtil';
import { VideoView } from './VideoView';
import { INTERVAL } from '../Constants';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as knnClassifier from '@tensorflow-models/knn-classifier';
import * as tf from '@tensorflow/tfjs';
import { activation } from '@tensorflow/tfjs-layers/dist/exports_layers';

const knnStyles = (theme: Theme) => {
  return checkSheet({
    root: {},
  });
};

interface IKnnTestState {
  prediction: string;
  buttonsDisabled: boolean;
}

interface IKnnTestProps extends WithStyles<typeof knnStyles> {}

class KnnTest extends Component<IKnnTestProps, IKnnTestState> {
  model!: mobilenet.MobileNet;
  activation!: tf.Tensor<tf.Rank>;
  classifier!: knnClassifier.KNNClassifier;
  numExamplesAdded = 0;

  classes = ['A', 'B', 'C'];
  state = { prediction: 'None', buttonsDisabled: true };

  async componentDidMount() {
    if (!this.model) {
      this.model = await mobilenet.load();
      this.classifier = knnClassifier.create();
      this.setState({ buttonsDisabled: false });
      console.log('Model loaded.');
    }
  }

  detectFrame(video: HTMLVideoElement, elapsed: number) {
    if (!this.model || !this.classifier) return;

    this.activation = this.model.infer(video);
    if (this.numExamplesAdded <= 0) return;
    this.classifier.predictClass(this.activation).then(result => {
      this.setState({ prediction: this.classes[result.classIndex] });
    });
  }

  videoViewReady(width: number, height: number) {}

  addExample(classId: number) {
    if (!this.classifier) return;

    this.classifier.addExample(this.activation, classId);
    this.numExamplesAdded++;
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <VideoView
          onFrame={this.detectFrame.bind(this)}
          onInit={this.videoViewReady.bind(this)}
          interval={INTERVAL}
        />
        <Button
          onClick={() => this.addExample(0)}
          disabled={this.state.buttonsDisabled}
        >
          A
        </Button>
        <Button
          onClick={() => this.addExample(1)}
          disabled={this.state.buttonsDisabled}
        >
          B
        </Button>
        <Button
          onClick={() => this.addExample(2)}
          disabled={this.state.buttonsDisabled}
        >
          C
        </Button>
        <Typography variant="h6" color="inherit" noWrap>
          The this is a class {this.state.prediction}
        </Typography>
      </React.Fragment>
    );
  }
}

export default withStyles(knnStyles, { withTheme: true })(KnnTest);
