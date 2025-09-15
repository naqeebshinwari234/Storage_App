import { useEffect, useRef, useState } from "react";
import Card from "./components/Card";
import "./output.css";
import ProgressBar from "./components/ProgressBar";
const App = () => {
  const [items, setItems] = useState([]);
  const [progress, setPorgress] = useState(0);
  const [path, setPath] = useState("/");
  const folderRef = useRef([]);
  const [isUploading, setIsUploading] = useState(false);
  const URL = "http://localhost:3000/";
  async function fetchItem(url) {
    const res = await fetch(url);
    const data = await res.json();
    setItems(data);
    const [userURL, query] = url?.split("?");
    const arr = userURL?.split("/");
    const endURL = arr.at(-1);
    folderRef.current.push(endURL);
    const finalPath = folderRef.current
      .filter(Boolean)
      .reduce((acc, curr, i) => {
        return acc + curr + "/";
      }, "/");
    setPath(finalPath);
  }
  function goBack() {
    const backPath = path.split("/");
    backPath.pop();
    backPath.pop();
    const generatedBackPath = backPath
      .filter(Boolean)
      .reduce((acc, curr, i) => {
        return acc + curr + "/";
      }, "/");
    setPath(generatedBackPath);
    folderRef.current = folderRef.current.filter((item) => item !== "");
    folderRef.current.pop();
    fetchItem(URL + generatedBackPath);
  }
  function uploadFile(e) {
    const file = e.target.files[0];
    const xhr = new XMLHttpRequest();
    xhr.open("POST", URL, true);
    xhr.addEventListener("load", () => {
      console.log(xhr.responseText);
      setIsUploading(false);
      fetchItem(`http://localhost:3000${path}`);
    });
    xhr.addEventListener("loadstart", () => {
      setIsUploading(true);
    });
    xhr.upload.addEventListener("progress", (e) => {
      setPorgress(((e.loaded / e.total) * 100).toFixed(0));
    });
    xhr.setRequestHeader("filename", path + file.name);
    xhr.send(file);
  }
  useEffect(() => {
    fetchItem(URL);
  }, []);
  return (
    <>
      <button
        className="text-xl p-2 mt-8 ml-[5rem] absolute cursor-pointer border-1   "
        onClick={goBack}
      >
        Back {"<-"}
      </button>
      {isUploading ? <ProgressBar progress={progress} /> : ""}{" "}
      <div className="min-h-screen bg-gray-100 p-6  ">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          My Storage {path}
        </h1>
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          {items.map((file) => (
            <Card
              key={file.name}
              name={file.name}
              type={file.type}
              fetchItem={fetchItem}
              path={file.path}
              currPath={path}
            />
          ))}
        </div>
        <div className="flex items-center justify-center  mt-3 gap-2 w-full ">
          <p className="flex items-center cursor-pointer   gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors">
            <input onChange={uploadFile} type="file" />
          </p>{" "}
        </div>
      </div>
    </>
  );
};

export default App;
