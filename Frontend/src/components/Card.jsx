import { useEffect, useState } from "react";
import { FaFolder, FaFile, FaDownload, FaFolderOpen } from "react-icons/fa";

const Card = ({ name, type, fetchItem, path, currPath }) => {
  async function Delete() {
    const res = await fetch("http://localhost:3000", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        path,
      }),
    });
    const data = await res.text();
    console.log(data);
    fetchItem(`http://localhost:3000${currPath}`);
  }
  async function Rename() {
    const newName = prompt("Enter the New Name;" + `  oldName:  ${name}`);
    console.log(newName.length);
    if (newName.length > 4) {
      const res = await fetch("http://localhost:3000", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          path,
          newName: currPath + "/" + newName,
        }),
      });
      const data = await res.text();
      console.log(data);
      fetchItem(`http://localhost:3000${currPath}`);
    } else {
      alert("write a valid name");
    }
  }
  return (
    <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center gap-4">
        <div className="text-2xl">
          {type === "folder" ? (
            <FaFolder className="text-indigo-600" />
          ) : (
            <FaFile className="text-green-500" />
          )}
        </div>
        <div className="text-gray-700 font-medium">{name}</div>
      </div>
      <div className="flex gap-2">
        <a
          onClick={
            type === "folder"
              ? (e) => {
                  e.preventDefault();
                  fetchItem(`http://localhost:3000${path}?action=open`);
                }
              : () => {}
          }
          href={
            type === "folder" ? "" : `http://localhost:3000${path}?action=open`
          }
          target={type === "folder" ? "_self" : "_blank"}
          rel={type === "folder" ? "noopener noreferrer" : undefined}
          className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <FaFolderOpen /> Open
        </a>
        {type === "folder" ? (
          ""
        ) : (
          <a
            target="_blank"
            href={`http://localhost:3000${path}?action=download`}
            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
          >
            <FaDownload /> Download
          </a>
        )}
        <button
          onClick={Delete}
          className="flex items-center gap-1 cursor-pointer bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={Rename}
          className="flex items-center gap-1 cursor-pointer bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
        >
          Rename
        </button>
      </div>
    </div>
  );
};

export default Card;
