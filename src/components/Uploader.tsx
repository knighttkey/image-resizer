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
  const [fileList, setFileList] = useState<File[]>([]);
  const [zipName, setZipName] = useState<string>("zipFile");
  const [imageQuality, setImageQuality] = useState<number>(1);
  const [format, setFormat] = useState<string>("jpeg");
  const [renameRule, setRenameRule] = useState<string>("initial");
  const [customName, setCustomName] = useState<string>("");
  const [qualityMenuShow, setQualityMenuShow] = useState<Boolean>(false);
  const [formatMenuShow, setFormatMenuShow] = useState<Boolean>(false);
  const [ruleMenuShow, setRuleMenuShow] = useState<Boolean>(false);
  const [sizeLimit, setSizeLimit] = useState<number>(1);

  const roundTo = ( num:number, decimal:number ) => { 
      return Math.round( ( num + Number.EPSILON ) * Math.pow( 10, decimal ) )/ Math.pow( 10, decimal ); 
  }

  const getMaxFile = (filePack:File[]) => {
    let b = Math.max(...filePack?.map(f=>f.size))
    console.log('b', b)
    console.log('b_kb', b/1024)
    console.log('b_mb', b/1024/1024)
    let maxFile = filePack.filter((item)=>{
      return item.size === Math.max(...filePack?.map(f=>f.size))
    })[0]
    console.log('maxFile', maxFile)
    return maxFile
    // return maxFile.size;
    
  }

  function processFile(file: File, formatParam:string, imageQualityParam:number) {
    console.log('=======================================')
    console.log('file', file)
    console.log('formatParam', formatParam)
    console.log('imageQualityParam', imageQualityParam)
    console.log('=======================================')
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
                console.log('blob', blob)
                resolve({imageUrl: URL.createObjectURL(blob), size:blob.size, format: format});
              },
              `image/${format}`,
              imageQuality
            );
            // canvas.toDataURL("image/webp");
          });
        })
        .then((imageObj:any) => {
          console.log('imageObj', imageObj)
          // Load image for display on the page
          return new Promise(function (resolve, reject) {
            let scaledImg = new Image();

            scaledImg.addEventListener("load", function () {
              resolve({ imageURL: imageObj.imageURL, scaledImg, size: imageObj.size});
            });

            scaledImg.setAttribute("src", imageObj.imageURL as string);

            // console.log("imageURL", imageURL);
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
    setFileCount(eventfileList.length);
    setFileList(eventfileList);
    let maxFile = getMaxFile(eventfileList)
    if(!maxFile) return;
    console.log('maxFile.size', maxFile.size)
    console.log('maxFile.size/1024_kb', maxFile.size/1024)
    console.log('maxFile.size/1024/1024_mb', maxFile.size/1024/1024)
    let maxFileProcessResult = maxFile.size/1024/1024;

    // let aaaa = getRecommendQuality(maxFile, format, imageQuality)
    // console.log('aaaa', aaaa)
    // if(aaaa > sizeLimit) {

    // }
    // let testProcessJ = await processFile(maxFile, 'jpeg');
    // console.log('testProcessJ', testProcessJ)
    // let testProcessP = await processFile(maxFile, 'png');
    // console.log('testProcessP', testProcessP)
    // let testProcessW = await processFile(maxFile, 'webp');
    // console.log('testProcessW', testProcessW)
  };

  const getRecommendQuality = async(maxFile:File, formatParam:string, imageQualityParam:number) => {
    console.log('===============imageQualityParam', imageQualityParam)
    // if(imageQualityParam === 0.1 && (format === 'jpeg' || format === 'png')) {
    //   // setFormat('webp');
    //   getRecommendQuality(maxFile, 'webp', roundTo(imageQualityParam, 1));
    // } else if(imageQualityParam===0.1 && format === 'webp') {
    //   alert('還是很大 放棄')
    // };
    // if(imageQualityParam <= 0.1) return;
    if(imageQualityParam <= 0) return;
    console.log('__________________imageQualityParam', imageQualityParam)
    console.log('--------------------------------------------------------------')
    let testProcess:any = await processFile(maxFile, format, imageQualityParam);
    console.log('testProcess', testProcess)
    console.log('testProcess.size/1024/1024', testProcess.size/1024/1024)
    console.log('sizeLimit', sizeLimit)
    if(testProcess.size/1024/1024 > sizeLimit) {
      console.log('太大了')
      console.log('imageQualityParam', imageQualityParam)
      getRecommendQuality(maxFile, formatParam, roundTo(imageQualityParam-0.1, 1));
    } else {
      console.log('可以')
      // setImageQuality(imageQualityParam > 0.1 ? imageQualityParam : 0.1)
      setImageQuality(imageQualityParam)
    }
    return testProcess;
  }

  const handleFileResize = () => {
    if(!fileList) return;
    const results = fileList.map(async (eachFile: File) => {
      const res:any = await processFile(eachFile, format, imageQuality);
      console.log("res", res);
      return { blobUrl: res.imageUrl, fileName: eachFile.name };
    });

    var zip = new JSZip();
    var count = 0;
    var zipFilename = `${zipName}.zip`;

    console.log("results", results);
    results.forEach((item, index) => {
      console.log("___________item", item);
      return item.then((obj) => {
        // var filename = `${obj.fileName}-${index + 1}.${format}`;
        let fileNameFragment = obj.fileName.split(".");
        console.log('fileNameFragment', fileNameFragment)
        let originalFilenameExtension = fileNameFragment[fileNameFragment.length-1]
        console.log('originalFilenameExtension', originalFilenameExtension)
        let filename = `${obj.fileName.replace(originalFilenameExtension, format)}`;
        console.log("obj", obj);
        JSZipUtils.getBinaryContent(
          obj.blobUrl,
          function (err: any, data: ArrayBuffer) {
            console.log('=====================data', data)
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

  const qualityList = ['0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0'];
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
            onChange={(e) => setCustomName(e.target.value)}
            value={customName}
            placeholder={`fileName-1, fileName-2...`}
          />
        </div>
      ) : null}

      {/* <div className="area">
          <div className="title">檔案大小限制</div>
          <input
            type="number"
            className="custom_image_name"
            onChange={(e) => setSizeLimit(Number(e.target.value))}
            value={sizeLimit}
            min={0.2}
          /> <div className="unit">MB</div>
        </div> */}
      <button onClick={()=>handleFileResize()}>轉換</button>
    </div>
  );
};
