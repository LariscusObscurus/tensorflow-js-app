export interface IDetectedImage {
  data: string;
  label: string;
  key: number;
  details?: IImageDetails
}

export interface IImageDetails {
  description: {
    tags: Array<string>,
    captions: Array<{
      text: string,
      confidence: number
    }>
  }
}
