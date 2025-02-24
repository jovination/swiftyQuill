import {  RiFolderOpenLine, RiCloudLine } from "react-icons/ri"
import { PiTreeStructure } from "react-icons/pi";

import { RiEditCircleLine } from "react-icons/ri";

function Featured() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:p-10">
      <div className="w-[345px] h-auto  rounded-[30px] p-6 bg-[#F4F4F4] shadow-sm flex flex-col gap-10 justify-between">
      <RiEditCircleLine className="text-4xl text-black self-end" />
        <div className="space-y-2 p-6 bg-[#FEFEFE] rounded-[20px]">
          <span className="text-xl font-medium">Easy Note Taking</span>
          <p className="text-sm text-gray-600">
            Capture ideas instantly with a distraction-free interface, making writing and brainstorming seamless.
          </p>
        </div>
      </div>

      <div className="w-[345px] h-auto rounded-[30px] p-6 bg-[#F4F4F4] shadow-sm flex flex-col gap-10 justify-between">
      <PiTreeStructure className="text-4xl text-black self-end" />
        <div className="space-y-2 p-6 bg-[#FEFEFE] rounded-[20px]">
          <span className="text-xl font-medium">Organized Structure</span>
          <p className="text-sm text-gray-600">
            Keep your notes organized with customizable tags, and categories for easy access and management.
          </p>
        </div>
      </div>

      <div className="w-[345px] h-auto rounded-[30px] p-6 bg-[#F4F4F4] shadow-sm flex flex-col gap-10 justify-between">
        <RiCloudLine className="text-4xl text-black self-end" />
        <div className="space-y-2 p-6 bg-[#FEFEFE] rounded-[20px]">
          <span className="text-xl font-medium">Seamless Syncing</span>
          <p className="text-sm text-gray-600">
            Sync your notes automatically across devices, ensuring your content stays updated and accessible anytime.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Featured

