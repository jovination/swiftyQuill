"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { TbCapture } from "react-icons/tb";
import { BiEditAlt } from "react-icons/bi";
import { LuListTodo } from "react-icons/lu";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaMicrophone } from "react-icons/fa6";
import { ImSpinner8 } from "react-icons/im";

interface NoteData {
    title: string;
    content: string;
    imageUrl: string | null;
}

interface TakingNotesButtonsProps {
    onNoteCreated?: () => void;
}

function TakingNotesButtons({ onNoteCreated }: TakingNotesButtonsProps){
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [noteData, setNoteData] = useState<NoteData>({
        title: '',
        content: '',
        imageUrl: null
    });
    const [isSaving, setIsSaving] = useState(false);

    const toggleInputField = () => {
        setIsInputVisible(!isInputVisible);
    };

    const handleInputChange = (field: keyof NoteData, value: string | null) => {
        setNoteData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveNote = async () => {
        if (!noteData.title.trim() && !noteData.content.trim()) return;
        
        setIsSaving(true);
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(noteData),
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            // Reset form after successful save
            setNoteData({
                title: '',
                content: '',
                imageUrl: null
            });
            setIsInputVisible(false);
            
            // Trigger the callback to refresh notes
            onNoteCreated?.();
        } catch (error) {
            console.error('Error saving note:', error);
            // You might want to show an error message to the user here
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form when canceling
        setNoteData({
            title: '',
            content: '',
            imageUrl: null
        });
        setIsInputVisible(false);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Here you would typically upload the file and get a URL
            // For now, we'll just create a local URL for preview
            const imageUrl = URL.createObjectURL(file);
            handleInputChange('imageUrl', imageUrl);
        }
    };

    return(
    <div className="w-full  flex flex-col items-center gap-4">
        {/* Conditionally render the input field based on isInputVisible state */}
        {isInputVisible && (
            <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto min-h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-3">
                {/* Title Input */}
                <input
                    type="text"
                    value={noteData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full text-md font-medium outline-none bg-transparent border-none placeholder:text-gray-400 placeholder:font-medium"
                    placeholder="Note title..."
                />
                
                {/* Divider line */}
                <div className="w-full h-px bg-gray-200"></div>
                
                {/* Content Textarea */}
                <textarea 
                    value={noteData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full h-24 outline-none bg-transparent resize-none placeholder:text-gray-400 text-sm" 
                    placeholder="Write a note..."
                ></textarea>
                
                {/* Image preview if uploaded */}
                {noteData.imageUrl && (
                    <div className="relative">
                        <img 
                            src={noteData.imageUrl} 
                            alt="Note attachment" 
                            className="max-w-full h-auto max-h-32 rounded-lg object-cover"
                        />
                        <button
                            onClick={() => handleInputChange('imageUrl', null)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                {/* Bottom controls */}
                <div className="flex items-center justify-between pt-2">
                    <label className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[#0D0D0D]/5 px-4 text-black transition hover:bg-[#0D0D0D]/10">
                        <svg className="h-5 w-5" viewBox="0 0 104.9 96.17" xmlns="http://www.w3.org/2000/svg">
                            <title />
                            <g data-name="Layer 2" id="Layer_2">
                                <g data-name="Layer 1" id="Layer_1-2">
                                    <path d="M27.32,76.5A16.37,16.37,0,0,1,11.83,65.34l-.15-.5a16,16,0,0,1-.76-4.74V30.3L.32,65.7a9.93,9.93,0,0,0,7,12l67.59,18.1a10,10,0,0,0,2.52.32A9.75,9.75,0,0,0,86.83,89L90.77,76.5Z"/>
                                    <path d="M39.34,30.6a8.74,8.74,0,1,0-8.74-8.74A8.75,8.75,0,0,0,39.34,30.6Z"/>
                                    <path d="M94,0H28.41A10.94,10.94,0,0,0,17.48,10.93V59A10.94,10.94,0,0,0,28.41,69.94H94A10.94,10.94,0,0,0,104.9,59V10.93A10.94,10.94,0,0,0,94,0ZM28.41,8.74H94a2.19,2.19,0,0,1,2.19,2.19V42L82.35,25.85a7.83,7.83,0,0,0-5.86-2.69,7.64,7.64,0,0,0-5.84,2.76L54.42,45.4l-5.29-5.28a7.67,7.67,0,0,0-10.84,0L26.22,52.19V10.93A2.19,2.19,0,0,1,28.41,8.74Z"/>
                                </g>
                            </g>
                        </svg>
                        <Input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleCancel}
                            className="h-[40px] rounded-[12px] bg-[#0D0D0D]/5 hover:bg-[#0D0D0D]/10 text-black"
                        >
                            <RxCross2 />
                        </Button>
                        <Button
                            onClick={handleSaveNote}
                            disabled={(!noteData.title.trim() && !noteData.content.trim()) || isSaving}
                            className="h-[40px] rounded-[12px] bg-[#58A942]/10 hover:bg-[#58A942]/15 text-[#58A942] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <ImSpinner8 className="animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <MdDone className="text-[#58A942]" />
                                    Done
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-background max-w-[352px] w-full h-[64px] rounded-3xl border border-[#EBEBEB]/50 shadow-md p-2 flex items-center justify-between">
            <Button
                className="h-[48px] rounded-[20px] bg-black/5 text-black hover:bg-black/10"
            >
                <LuListTodo />
                Todos
            </Button>

            <Button
                onClick={toggleInputField}
                className="h-[48px] rounded-[20px] bg-black/5 text-black hover:bg-black/10"
            >
                <BiEditAlt />
                Write
            </Button>

            <Button
                className="h-[48px] rounded-[20px]"
            >
               <FaMicrophone className="text-4xl text-green-400" />
                Transcribe
            </Button>
        </div>
    </div>
    )
}

export default TakingNotesButtons;