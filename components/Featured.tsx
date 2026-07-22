import React from 'react'
import { RiQuillPenLine, RiCloudLine } from "react-icons/ri"
import { PiTreeStructure } from "react-icons/pi";



const featuresData = [
  {
    icon: RiQuillPenLine, 
    title: "Easy Note Taking",
    description: "Capture your thoughts instantly with AI voice notes in a calm space designed for focus.",
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
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:p-10">
      {features.map((feature, index) => (
        <div 
          key={index} 
          className="w-[345px] h-auto rounded-[30px] p-6 bg-muted/50 dark:bg-white/5 shadow-sm flex flex-col gap-10 justify-between transition-colors"
        >
          <feature.icon className="text-4xl text-foreground self-end" />
          <div className="space-y-2 p-6 bg-card dark:bg-white/10 rounded-[20px] transition-colors">
            <span className="text-xl font-medium dark:text-white">{feature.title}</span>
            <p className="text-sm text-muted-foreground dark:text-gray-300">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Featured