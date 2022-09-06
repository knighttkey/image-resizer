import React, {
  DragEvent,
  useRef,
  useState,
  MouseEvent,
  useEffect
} from "react";
import "./../styles/Template.scss";

type Props = {};

export default (props: Props) => {
  const {} = props;
  const textRef = useRef(null);
  const [base64Data, setBase64Data] = useState<string[]>([]);

const handleFileSelect = (evt) => {
  console.log('evt', evt)
  var fileList = [...evt.target.files];
  fileList.forEach((eachFile:File)=>{
    var reader = new FileReader();
    reader.readAsBinaryString(eachFile);
    reader.onload = (function(theFile) {
      console.log('theFile', theFile)
      return function(e) {
        if(!e.target) return;
        var binaryData:any = e.target.result;
        //Converting Binary Data to base 64
        var base64String = window.btoa(binaryData);
        //showing file converted to base64
        if(!textRef.current) return;
        // textRef.current.value = base64String;
        // console.log('base64String', base64String)
        const tempData = [...base64Data];
        // if(!tempData) return;
        tempData.push(base64String)
        setBase64Data(tempData)
        alert('File converted to base64 successfuly!\nCheck in Textarea');
      };
    })(eachFile);
    // Read in the image file as a data URL.
    

  })

  const content = JSON.stringify(base64Data)
  let a = document.createElement('a')
  let file = new Blob([content], { type: 'text/json' })
  a.href = URL.createObjectURL(file)
  a.download = `eventLog_${'searchTimeFileName'}.json`
  a.click()

}

  return (
    <div className="_container">
      <input type="file" id="files" name="files" multiple={true}  onChange={(evt)=>handleFileSelect(evt)} />
      <br />
      <textarea id="base64" rows={5} ref={textRef}></textarea>
    </div>
  );
};
