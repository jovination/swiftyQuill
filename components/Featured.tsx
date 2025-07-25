'use client'

import React from 'react'
import { RiFolderOpenLine, RiCloudLine, RiEditCircleLine } from "react-icons/ri"
import { PiTreeStructure } from "react-icons/pi";

// Define the data structure for features
const featuresData = [
{
 icon: RiEditCircleLine,
 title: "Easy Note Taking",
 description: "Capture ideas instantly with a distraction-free interface, making writing and brainstorming seamless.",
},
{
 icon: PiTreeStructure,
 title: "Organized Structure",
 description: "Keep your notes organized with customizable tags, and categories for easy access and management.",
},
{
 icon: RiCloudLine,
 title: "Seamless Syncing",
 description: "Sync your notes automatically across devices, ensuring your content stays updated and accessible anytime.",
}
];

function Featured({ features = featuresData }) {
return (
<div className="flex flex-col xl:flex-row items-center justify-center gap-8 py-10 ">
 {features.map((feature, index) => (
<div
key={index}
className="w-[350px] sm:w-full xl:w-[345px] h-auto rounded-[30px] p-6 bg-[#0d0d0d]/5 shadow-sm flex flex-col gap-10 justify-between"
>
<feature.icon className="text-4xl text-black self-end" />
<div className="space-y-2 p-6 bg-[#FEFEFE] rounded-[20px]">
<span className="text-xl font-medium">{feature.title}</span>
<p className="text-sm text-gray-600">
 {feature.description}
</p>
</div>
</div>
 ))}
</div>
 )
}

export default Featured