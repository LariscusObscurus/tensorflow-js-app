import { IDetectedImage, IImageDetails } from './IDetectedImage';
import { API_KEY } from './ApiKey';

const URL = 'https://westeurope.api.cognitive.microsoft.com/vision/v2.0/analyze?visualFeatures=Description&language=en';

export default function(img: IDetectedImage): Promise<IDetectedImage> {
  const binaryData = dataURItoBlob(img.data);
  return fetch(URL, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Ocp-Apim-Subscription-Key': API_KEY,
    },
    body: binaryData,
  })
    .then(response => response.json())
    .then((details: IImageDetails) => {
      return {
        ...img,
        details
      }
    });
};

// https://gist.github.com/suuuzi/06a3b0b6741e6a90d83548aa8ac9666a
function dataURItoBlob(dataURI: string) {
  // convert base64/URLEncoded data component to raw binary data held in a string
  let byteString;
  if (dataURI.split(',')[0].indexOf('base64') >= 0)
    byteString = atob(dataURI.split(',')[1]);
  else
    byteString = unescape(dataURI.split(',')[1]);

  // separate out the mime component
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to a typed array
  const ia = new Uint8Array(byteString.length);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ia], { type: mimeString });
}
