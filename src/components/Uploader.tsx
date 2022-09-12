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
import saveAs from "save-as";
import JSZip from "JSZip";
import JSZipUtils from "jszip-utils";
import "./../styles/Uploader.scss";
import Dropdown from "./Dropdown";
import DropExpand from "./DropExpand";

type Props = {};

export default (props: Props) => {
  const {} = props;
  const [fileCount, setFileCount] = useState<number>(0);
  const [fileList, setFileList] = useState<File[]>();
  const [zipName, setZipName] = useState<string>("zipFile");
  const [imageQuality, setImageQuality] = useState<number>(1);
  const [format, setFormat] = useState<string>("jpeg");
  const [renameRule, setRenameRule] = useState<string>("initial");
  const [customName, setCustomName] = useState<string>("");
  const [qualityMenuShow, setQualityMenuShow] = useState<Boolean>(false);
  const [formatMenuShow, setFormatMenuShow] = useState<Boolean>(false);
  const [ruleMenuShow, setRuleMenuShow] = useState<Boolean>(false);

  function processFile(file: File) {
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
          // console.log("rawImage", rawImage);
          return new Promise(function (resolve, reject) {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = rawImage.width;
            canvas.height = rawImage.height;
            ctx.drawImage(rawImage, 0, 0);

            canvas.toBlob(
              function (blob: any) {
                resolve(URL.createObjectURL(blob));
              },
              `image/${format}`,
              imageQuality
            );
            // canvas.toDataURL("image/webp");
          });
        })
        .then((imageURL) => {
          // Load image for display on the page
          return new Promise(function (resolve, reject) {
            let scaledImg = new Image();

            scaledImg.addEventListener("load", function () {
              resolve({ imageURL, scaledImg });
            });

            scaledImg.setAttribute("src", imageURL as string);

            // console.log("imageURL", imageURL);
            resolveOuter(imageURL as string[]);
          });
        })
        .then(async function (data) {
          console.log("________data", data);
          // console.log(`${file.name}.webp`, data);
        });
    });
  }
  const handleFileSelect = (evt: any) => {
    var eventfileList = [...evt.target.files];
    console.log("eventfileList", eventfileList);
    setFileCount(eventfileList.length);
    setFileList(eventfileList);
  };

  const handleFileResize = () => {
    if(!fileList) return;
    const results = fileList.map(async (eachFile: File) => {
      const res = await processFile(eachFile);
      console.log("res", res);
      return { blobUrl: res, fileName: eachFile.name };
    });

    var zip = new JSZip();
    var count = 0;
    var zipFilename = `${zipName}.zip`;

    console.log("results", results);
    results.forEach((item, index) => {
      console.log("___________item", item);
      return item.then((obj) => {
        // var filename = `${obj.fileName}-${index + 1}.${format}`;
        var filename = `${obj.fileName}.${format}`;
        console.log("obj", obj);
        JSZipUtils.getBinaryContent(
          obj.blobUrl,
          function (err: any, data: ArrayBuffer) {
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
          }
        );
      });
    });
  };

  const qualityList = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const changeQuality = (item: number) => {
    setImageQuality(item);
    setQualityMenuShow(false);
  };
  const formatList = ["jpeg", "png", "webp"];
  const changeFormat = (item: string) => {
    setFormat(item);
    setFormatMenuShow(false);
  };

  const ruleList = ["initial", "custom"];
  const changeRule = (item: string) => {
    setRenameRule(item);
    setRuleMenuShow(false);
  };
  return (
    <div className="uploader_container">
      <div className="area file_picker_area">
        <div className="title">選擇圖片</div>
        <input
          className="file_picker"
          type="file"
          id="files"
          name="files"
          multiple={true}
          accept="image/*"
          onChange={(evt) => handleFileSelect(evt)}
        />
      </div>
      <div className="area zip_file_name_area">
        <div className="title">壓縮檔名稱</div>
        <input
          className="file_name"
          onChange={(e) => setZipName(e.target.value)}
          value={zipName}
        />
      </div>

      <div className="area">
        <div className="title">畫質</div>
        <DropExpand
          showMenu={qualityMenuShow}
          setShowMenu={setQualityMenuShow}
          defaultValue={imageQuality}
          menuList={qualityList}
          action={changeQuality}
        ></DropExpand>
      </div>
      <div className="area">
        <div className="title">圖片格式</div>
        <DropExpand
          showMenu={formatMenuShow}
          setShowMenu={setFormatMenuShow}
          defaultValue={format}
          menuList={formatList}
          action={changeFormat}
        ></DropExpand>
      </div>
      <div className="area">
        <div className="title">命名規則</div>
        <DropExpand
          showMenu={ruleMenuShow}
          setShowMenu={setRuleMenuShow}
          defaultValue={renameRule}
          menuList={ruleList}
          action={changeRule}
        ></DropExpand>
      </div>
      {renameRule === "custom" ? (
        <div className="area">
          <div className="title">自定義檔名</div>
          <input
            className="custom_image_name"
            onChange={(e) => setCustomName(e.target.value)}
            value={customName}
            placeholder={`fileName-1, fileName-2...`}
          />
        </div>
      ) : null}
      <button onClick={()=>handleFileResize()}>轉換</button>
    </div>
  );
};
