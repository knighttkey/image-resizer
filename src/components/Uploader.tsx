import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect,
  ChangeEvent,
} from "react";
import "./../styles/Template.scss";
import axios from "axios";
import saveAs from "save-as";
import JSZip from "JSZip";
import JSZipUtils from "jszip-utils";
import "./../styles/Uploader.scss";
import Dropdown from "./Dropdown";
import DropExpand from "./DropExpand";
import * as R from "ramda";

type Props = {};

interface FileWithRatio extends File {
  ratio?: number;
  imageUrl?: string;
  originPreview?: string;
  customName?: string;
}

export default (props: Props) => {
  const {} = props;
  const [fileList, setFileList] = useState<FileWithRatio[]>([]);
  const [zipName, setZipName] = useState<string>("zipFile");
  const [imageQuality, setImageQuality] = useState<number>(1);
  const [format, setFormat] = useState<string>("jpeg");
  const [renameRule, setRenameRule] = useState<string>("initial");
  const [customName, setCustomName] = useState<string>("");
  const [qualityMenuShow, setQualityMenuShow] = useState<Boolean>(false);
  const [formatMenuShow, setFormatMenuShow] = useState<Boolean>(false);
  const [ruleMenuShow, setRuleMenuShow] = useState<Boolean>(false);
  const [sizeLimit, setSizeLimit] = useState<number>(1);
  const [imageWidthRatio, setImageWidthRatio] = useState<number>(1);
  const [filePack, setFilePack] = useState<any>();
  const [converting, setConverting] = useState<Boolean>(false);
  const [hasConverted, setHasConverted] = useState<Boolean>(false);
  const [hasDownloaded, setHasDownloaded] = useState<Boolean>(false);
  console.log("filePack", filePack);

  const roundTo = (num: number, decimal: number) => {
    return (
      Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) /
      Math.pow(10, decimal)
    );
  };

  const getMaxFile = (filePack: File[]) => {
    let b = Math.max(...filePack?.map((f) => f.size));
    console.log("b", b);
    console.log("b_kb", b / 1024);
    console.log("b_mb", b / 1024 / 1024);
    let maxFile = filePack.filter((item) => {
      return item.size === Math.max(...filePack?.map((f) => f.size));
    })[0];
    console.log("maxFile", maxFile);
    return maxFile;
  };

  function processFile(
    file: File,
    formatParam: string,
    imageQualityParam: number,
    scaleRatio: number
  ) {
    // console.log("=======================================");
    // console.log("file", file);
    // console.log("formatParam", formatParam);
    // console.log("imageQualityParam", imageQualityParam);
    // console.log("scaleRatio", scaleRatio);
    // console.log("=======================================");
    if (!file) {
      return;
    }

    return new Promise<string[]>((resolveOuter, reject) => {
      new Promise(function (resolve, reject) {
        let rawImage = new Image();

        rawImage.addEventListener("load", function () {
          resolve(rawImage);
        });

        rawImage.src = URL.createObjectURL(file);
      })
        .then(function (rawImage: any) {
          return new Promise(function (resolve, reject) {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = rawImage.width * scaleRatio;
            canvas.height = rawImage.height * scaleRatio;
            ctx.drawImage(
              rawImage,
              0,
              0,
              rawImage.width * scaleRatio,
              rawImage.height * scaleRatio
            );
            canvas.toBlob(
              function (blob: any) {
                console.log("blob", blob);
                resolve({
                  fileName: file.name,
                  imageUrl: URL.createObjectURL(blob),
                  size: blob.size,
                  format: format,
                });
              },
              `image/${format}`,
              imageQualityParam
            );
          });
        })
        .then((imageObj: any) => {
          console.log("imageObj", imageObj);
          return new Promise(function (resolve, reject) {
            let scaledImg = new Image();

            scaledImg.addEventListener("load", function () {
              resolve({
                imageURL: imageObj.imageURL,
                scaledImg,
                size: imageObj.size,
                fileName: imageObj.fileName,
              });
            });

            scaledImg.setAttribute("src", imageObj.imageURL as string);

            resolveOuter(imageObj);
          });
        })
        .then(async function (data) {
          console.log("________data", data);
          // console.log(`${file.name}.webp`, data);
        });
    });
  }
  const handleFileSelect = async (evt: any) => {
    var eventfileList = [...evt.target.files];
    console.log("eventfileList", eventfileList);
    eventfileList.forEach((fileItem) => {
      let originPreview = URL.createObjectURL(fileItem);
      fileItem.originPreview = originPreview;
    });

    setFileList(eventfileList);
    evt.target.value = "";
    setHasConverted(false);
    setHasDownloaded(false);
  };

  const getRecommend = async (
    thisFile: File,
    formatParam: string,
    imageQualityParam: number,
    ratioParam: number
  ) => {
    if (ratioParam <= 0) return;
    if (imageQualityParam <= 0) return;
    return new Promise<any>(async (resolve, reject) => {
      let testProcess: any = await processFile(
        thisFile,
        format,
        imageQualityParam,
        ratioParam
      );
      // console.log("testProcess", testProcess);
      // console.log("檔案轉換後大小", testProcess.size / 1024 / 1024, "MB");
      // console.log("sizeLimit", sizeLimit);
      let testRatio = sizeLimit / (testProcess.size / 1024 / 1024);
      let tempFileList = [...fileList];
      // console.log("tempFileList", tempFileList);

      if (testRatio > 1) {
        testRatio = 1;
        let index = tempFileList.indexOf(thisFile);
        tempFileList[index].ratio = testRatio;
      } else {
        testRatio = testRatio;
        let index = tempFileList.indexOf(thisFile);
        tempFileList[index].ratio = testRatio;
      }
      setFileList(tempFileList);
      if (testProcess.size / 1024 / 1024 > sizeLimit) {
        if (ratioParam <= 0.5) {
          resolve(
            getRecommend(
              thisFile,
              formatParam,
              roundTo(imageQualityParam - 0.1, 1),
              ratioParam
            )
          );
        } else {
          resolve(
            getRecommend(
              thisFile,
              formatParam,
              imageQualityParam,
              roundTo(ratioParam - 0.1, 1)
            )
          );
        }
      } else {
        console.log("ok");
        resolve({
          quality: imageQualityParam,
          ratio: ratioParam,
          fileName: thisFile.name,
        });
      }
    });
  };

  const handleFileResize = async () => {
    if (!fileList) return;
    setHasConverted(true);
    setConverting(true);
    const results = fileList.map(async (eachFile: File, eachIndex) => {
      const recommend = await getRecommend(
        eachFile,
        format,
        imageQuality,
        imageWidthRatio
      );
      console.log("recommend", recommend);
      const fileRes: any = await processFile(
        eachFile,
        format,
        recommend.quality,
        recommend.ratio
      );
      console.log("fileRes", fileRes);
      let percent = (eachIndex + 1) / fileList.length;
      console.log("eachIndex", eachIndex);
      console.log("eachIndex+1", eachIndex + 1);
      console.log("fileList.length", fileList.length);
      console.log("percent", percent);
      console.log("完成一個", eachIndex, eachFile.name);

      let tempFileList = [...fileList];
      let index = tempFileList.indexOf(eachFile);
      tempFileList[index].imageUrl = fileRes.imageUrl;

      let fileNameFragment = eachFile.name.split(".");
      let originalFilenameExtension =
        fileNameFragment[fileNameFragment.length - 1];
      let filename = "";
      if (renameRule === "initial") {
        filename = `${eachFile.name.replace(
          originalFilenameExtension,
          format
        )}`;
      } else if (renameRule === "custom") {
        filename = `${customName}-${index + 1}.${format}`;
      }

      tempFileList[index].customName = filename;

      return { blobUrl: fileRes.imageUrl, fileName: eachFile.name };
    });

    var zip = new JSZip();
    var count = 0;
    var zipFilename = `${zipName}.zip`;
    console.log("results", results);

    results.forEach((item, index) => {
      return item.then((obj: any) => {
        console.log("-----------------------------obj", obj);
        // var filename = `${obj.fileName}-${index + 1}.${format}`;
        let fileNameFragment = obj.fileName.split(".");
        let originalFilenameExtension =
          fileNameFragment[fileNameFragment.length - 1];
        let filename = "";
        if (renameRule === "initial") {
          filename = `${obj.fileName.replace(
            originalFilenameExtension,
            format
          )}`;
        } else if (renameRule === "custom") {
          filename = `${customName}-${index + 1}.${format}`;
        }
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
                console.log("content", content);
                setFilePack(content);
                setConverting(false);
                // saveAs(content, zipFilename);
                // setHasConverted(true);
              });
            }
          }
        );
      });
    });
  };

  const qualityList = [
    "0.1",
    "0.2",
    "0.3",
    "0.4",
    "0.5",
    "0.6",
    "0.7",
    "0.8",
    "0.9",
    "1.0",
  ];
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

  const downloadThisImg = (imageUrl: string, name: string) => {
    fetch(imageUrl, {
      method: "get",
      mode: "no-cors",
      referrerPolicy: "no-referrer",
    })
      .then((res) => res.blob())
      .then((res) => {
        const aElement = document.createElement("a");
        aElement.setAttribute("download", name);
        // console.log('video_res', res)
        const href = URL.createObjectURL(res);
        aElement.href = href;
        aElement.setAttribute("target", "_blank");
        aElement.click();
        URL.revokeObjectURL(href);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleChangeCustomName = (e: ChangeEvent) => {
    let instantName = (e.target as HTMLInputElement).value;
    setCustomName(instantName);
    let tempFileList = [...fileList];
    tempFileList.forEach((fileItem, fileIndex) => {
      tempFileList[fileIndex].customName = `${instantName}-${
        fileIndex + 1
      }.${format}`;
    });
    setFileList(tempFileList);
  };

  const downloadZip = () => {
    var zipFilename = `${zipName}.zip`;
    
    saveAs(filePack, zipFilename);
    setHasConverted(false);
    setHasDownloaded(true);
  }

  return (
    <div className="main_container">
      <div className="uploader_container">
        <div className="area file_picker_area">
          <div className="title">選擇圖片</div>
          <div className="upload_wrap">
            <input
              className="file_picker"
              type="file"
              id="files"
              name="files"
              multiple={true}
              accept="image/*"
              onChange={(evt) => handleFileSelect(evt)}
            />
            <div className="upload_btn">選擇</div>
          </div>
        </div>
        <div className="area zip_file_name_area">
          <div className="title">壓縮檔名稱</div>
          <input
            type="text"
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
              type="text"
              className="custom_image_name"
              onChange={(e) => handleChangeCustomName(e)}
              value={customName}
              placeholder={`fileName-1, fileName-2...`}
            />
          </div>
        ) : null}

        <div className="area file_size_limit_area">
          <div className="title">檔案大小限制</div>
          <input
            type="number"
            className="file_size_limit_input"
            onChange={(e) => setSizeLimit(Number(e.target.value))}
            value={sizeLimit}
            step={0.1}
            min={0.1}
          />{" "}
          <div className="unit">MB</div>
        </div>
        <div className="btn_area">
          <div
            className={`btn execute ${fileList.length && !hasConverted && !hasDownloaded ? "must_bounce" : "disable"}`}
            onClick={() => handleFileResize()}
          >
            轉換
          </div>
          <div
            className={`btn download ${hasConverted && !hasDownloaded ? "must_bounce" : "disable"}`}
            onClick={() => downloadZip()}
          >
            下載Ｚip
          </div>
        </div>
      </div>
      <div className="file_list_container">
        <div className="solid_wrap">
          {fileList.map((item, index) => {
            let finalName = "";
            if (renameRule === "custom") {
              finalName = item.customName
                ? item.customName
                : `${index + 1}.${format}`;
            } else {
              finalName = item.name;
            }
            return (
              <div className="each_file" key={index}>
                {/* <div className={`thumbnail ${item.imageUrl ? '':'no_image'}`} style={{backgroundImage:`url(${item.imageUrl?item.imageUrl:'images/image.svg'})`}}></div> */}
                <div
                  className={`thumbnail ${item.imageUrl ? "" : "no_image"}`}
                  style={{ backgroundImage: `url(${item.originPreview})` }}
                ></div>
                <div className="file_name">{finalName}</div>
                {/* <div className="file_name">{item.customName}</div> */}
                <div className="file_process">
                  <div
                    className={`progress_bar show`}
                    style={{ width: item.ratio ? item.ratio * 100 : 0 + "%" }}
                  ></div>
                </div>
                <div
                  className={`single_download_btn ${
                    item.imageUrl ? "" : "disable"
                  }`}
                  onClick={() =>
                    item.imageUrl
                      ? downloadThisImg(item.imageUrl, finalName)
                      : null
                  }
                >
                  下載
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
