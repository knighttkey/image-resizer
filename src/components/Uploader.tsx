import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect,
  ChangeEvent
} from "react";
import "./../styles/Template.scss";

type Props = {};

export default (props: Props) => {
  const {} = props;
  const textRef = useRef(null);
  const [base64Data, setBase64Data] = useState<string[]>([]);

  useEffect(() => {
    if (base64Data.length) {
      const obj = {
        dataList: base64Data,
        dataLength: base64Data.length
      };
      // const content = JSON.stringify(base64Data)
      const content = JSON.stringify(base64Data);
      // console.log('content', content)
      let a = document.createElement("a");
      let file = new Blob([content], { type: "text/json" });
      a.href = URL.createObjectURL(file);
      a.download = `eventLog_${"searchTimeFileName"}.json`;
      a.click();
    }
  }, [base64Data]);

  const handleFileSelect = (evt: any) => {
    console.log("evt", evt);
    var fileList = [...evt.target.files];
    const tempData = [...base64Data];
    fileList.forEach((eachFile: File) => {
      var reader = new FileReader();
      reader.readAsBinaryString(eachFile);
      reader.onload = (function (theFile) {
        console.log("theFile", theFile);
        return function (e) {
          if (!e.target) return;
          var binaryData: any = e.target.result;
          //Converting Binary Data to base 64
          var base64String = window.btoa(binaryData);
          //showing file converted to base64
          if (!textRef.current) return;

          tempData.push(base64String);
          setBase64Data(tempData);
        };
      })(eachFile);
    });
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
      <br />
      <textarea id="base64" rows={5} ref={textRef}></textarea>
    </div>
  );
};
