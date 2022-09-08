import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect,
  ChangeEvent
} from "react";
import "./../styles/Template.scss";
import axios from "axios";
import reactLogo from "./../assets/react.svg";
import saveAs from "save-as";
import JSZip from "JSZip";
import JSZipUtils from "jszip-utils";
type Props = {};

export default (props: Props) => {
  const {} = props;
  const [base64Data, setBase64Data] = useState<string[]>([]);
  const [urlList, setUrlList] = useState<string[]>([]);
  const [fileCount, setFileCount] = useState<number>(0);
  

  function processFile(file: File, tempUrlList: string[]) {
    if (!file) {
      return;
    }
    console.log(file);

    return new Promise<string[]>((resolveOuter, reject) => {
      // Load the data into an image
      new Promise(function (resolve, reject) {
        let rawImage = new Image();

        rawImage.addEventListener("load", function () {
          resolve(rawImage);
        });

        rawImage.src = URL.createObjectURL(file);
      })
        .then(function (rawImage: any) {
          // Convert image to webp ObjectURL via a canvas blob
          return new Promise(function (resolve, reject) {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = rawImage.width;
            canvas.height = rawImage.height;
            ctx.drawImage(rawImage, 0, 0);

            canvas.toBlob(function (blob: any) {
              resolve(URL.createObjectURL(blob));
            }, "image/webp");
          });
        })
        .then(function (imageURL) {
          // Load image for display on the page
          return new Promise(function (resolve, reject) {
            let scaledImg = new Image();

            scaledImg.addEventListener("load", function () {
              resolve({ imageURL, scaledImg });
            });

            scaledImg.setAttribute("src", imageURL);

            tempUrlList.push(imageURL);
            setUrlList(tempUrlList);
            // console.log("imageURL", imageURL);
            resolveOuter(imageURL);
          });
        })
        .then(async function (data) {
          // console.log(`${file.name}.webp`, data);
        });
    });
  }
  const handleFileSelect = (evt: any) => {
    var fileList = [...evt.target.files];
    const tempUrlList = [...urlList];
    setFileCount(fileList.length);
    const results = fileList.map(async (eachFile: File) => {
      const res = await processFile(eachFile, tempUrlList);
      return res;
    });

    var zip = new JSZip();
    var count = 0;
    var zipFilename = "zipFilename.zip";

    console.log("results", results);
    results.forEach((item,index)=>{
      var filename = `filename-${index + 1}.jpg`;
      return item.then((blobUrl)=>{
        JSZipUtils.getBinaryContent(blobUrl, function (err, data) {
          if (err) {
            throw err; // or handle the error
          }
          zip.file(filename, data, { binary: true });
          count++;
          if (count == results.length) {
              zip.generateAsync({ type: "blob" }).then(function (content) {
                saveAs(content, zipFilename);
              });

          }
        });
      })
    })
  };

  return (
    <div className="_container">
      <input
        type="file"
        id="files"
        name="files"
        multiple={true}
        accept="image/*"
        onChange={(evt) => handleFileSelect(evt)}
      />

      <div className="parent">
        <div id="origin"></div>
        <div id="download"></div>
        <img id="iii" src={reactLogo}></img>
      </div>
    </div>
  );
};
