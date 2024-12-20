import React from "react";

function Footer() {
  return (
    <div className="bg-slate-950 w-full px-10 py-2 flex tracking-tighter justify-center items-center overflow-hidden text-[.8rem]">
      <img
        className="w-10"
        src="https://cdn3d.iconscout.com/3d/premium/thumb/video-call-3d-illustration-download-in-png-blend-fbx-gltf-file-formats--logo-conference-chat-communication-business-training-pack-illustrations-3061900.png?f=webp"
        alt=""
      />
      <p className="ml-10 py-2 text-gray-400 font-mono">Developed By Subham Das</p>
      <p className="ml-10 py-2 text-gray-400 font-mono">&#169; 2024</p>
      <p className="ml-10 py-2 text-green-500 font-mono">
        <span className="w-[10px] h-[10px] bg-green-500 rounded-[50%] inline-block mr-2"></span>All systems normal
      </p>
    </div>
  );
}

export default Footer;
