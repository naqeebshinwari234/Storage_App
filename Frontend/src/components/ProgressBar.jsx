function ProgressBar({ progress }) {
  return (
    <div className="w-[90%] mt-4 ml-auto mr-auto bg-gray-100 rounded-full h-4 text-xl  border-black text-white border-1">
      <div
        className="bg-green-500 h-full rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;
