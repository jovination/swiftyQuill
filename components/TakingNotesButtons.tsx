"use client"
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { TbCapture } from "react-icons/tb";
import { BiEditAlt } from "react-icons/bi";
import { Home, Grid, Document, Calendar } from "reicon-react";
import { LuListTodo } from "react-icons/lu";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaMicrophone, FaPause, FaStop } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import { RiMic2AiFill } from "react-icons/ri";
import { toast } from "sonner";
import { FluentEmoji } from '@lobehub/fluent-emoji';
import EmojiPicker from 'emoji-picker-react';
import { useSession } from "next-auth/react";

interface NoteData {
    title: string;
    content: string;
    imageUrl: string | null;
}

interface TakingNotesButtonsProps {
    onNoteCreated?: () => void;
}

function TakingNotesButtons({ onNoteCreated }: TakingNotesButtonsProps){
    const { data: session } = useSession();
    const [isInputVisible, setIsInputVisible] = useState(false);
    const [isTranscribeVisible, setIsTranscribeVisible] = useState(false);
    const [isTodoVisible, setIsTodoVisible] = useState(false);
    const [isAddingTodo, setIsAddingTodo] = useState(false);
    const [newTodoTitle, setNewTodoTitle] = useState('');
    const [noteData, setNoteData] = useState<NoteData>({
        title: '',
        content: '',
        imageUrl: null
    });
    const [isSaving, setIsSaving] = useState(false);
    const [todoListTitle, setTodoListTitle] = useState('');
    const [todoTasks, setTodoTasks] = useState<{id: string, text: string, done: boolean}[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedEmoji, setSelectedEmoji] = useState('😀');

    const toggleInputField = () => {
        setIsInputVisible(!isInputVisible);
        if (!isInputVisible) {
            setIsTranscribeVisible(false);
            setIsTodoVisible(false);
        }
    };

    const toggleTranscribe = () => {
        setIsTranscribeVisible(!isTranscribeVisible);
        if (!isTranscribeVisible) {
            setIsInputVisible(false);
            setIsTodoVisible(false);
        }
    };

    const toggleTodo = () => {
        setIsTodoVisible(!isTodoVisible);
        if (!isTodoVisible) {
            setIsInputVisible(false);
            setIsTranscribeVisible(false);
        }
    };

    const handleInputChange = (field: keyof NoteData, value: string | null) => {
        setNoteData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveNote = async () => {
        if (!noteData.title.trim() && !noteData.content.trim()) return;
        
        // Save to local storage immediately
        const tempNote = {
            ...noteData,
            id: `temp-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isTemp: true
        };
        localStorage.setItem('tempNote', JSON.stringify(tempNote));
        
        setIsSaving(true);
        const toastId = toast.loading('Saving note...');
        
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

            const savedNote = await response.json();
            
            // Clear local storage and update UI
            localStorage.removeItem('tempNote');
            toast.success('Note saved successfully', { id: toastId });
            
            // Reset form
            setNoteData({
                title: '',
                content: '',
                imageUrl: null
            });
            setIsInputVisible(false);
            
            // Dispatch custom event for note creation
            window.dispatchEvent(new Event('noteCreated'));
            
            // Trigger the callback to refresh notes
            onNoteCreated?.();
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note. Your note is saved locally.', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Clear local storage when canceling
        localStorage.removeItem('tempNote');
        
        // Reset form
        setNoteData({
            title: '',
            content: '',
            imageUrl: null
        });
        setIsInputVisible(false);
    };

    const handleSaveTodoList = async () => {
        if (!todoListTitle.trim() || todoTasks.length === 0) {
            toast.error('Please add a title and at least one task');
            return;
        }

        const formattedContent = todoTasks.map(task => `- [${task.done ? 'x' : ' '}] ${task.text}`).join('\n');
        
        const noteDataToSave = {
            title: todoListTitle,
            content: formattedContent,
            imageUrl: null
        };

        setIsSaving(true);
        const toastId = toast.loading('Saving Todo List...');
        
        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteDataToSave),
            });

            if (!response.ok) throw new Error('Failed to save todolist');

            toast.success('Todo list saved successfully', { id: toastId });
            
            // Reset
            setTodoListTitle('');
            setTodoTasks([]);
            setIsTodoVisible(false);
            window.dispatchEvent(new Event('noteCreated'));
            onNoteCreated?.();
        } catch (error) {
            console.error('Error saving todolist:', error);
            toast.error('Failed to save todolist', { id: toastId });
        } finally {
            setIsSaving(false);
        }
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

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    let greeting = 'Good evening';
    const hour = now.getHours();
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    const currentDayIdx = now.getDay();
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const calendarDays = weekDays.map((dayLabel, index) => {
        const diff = index - currentDayIdx;
        const date = new Date(now);
        date.setDate(now.getDate() + diff);
        return {
            day: dayLabel,
            date: date.getDate().toString(),
            isActive: index === currentDayIdx,
            hasDot: [1, 3, 4].includes(index)
        };
    });

    return(
    <div className="w-full  flex flex-col items-center gap-4">
        {/* Conditionally render the Todo modal based on isTodoVisible state */}
        {isTodoVisible && (
            <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-4">
                {/* Header */}
                <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col flex-1 mr-4">
                        <span className="text-gray-400 text-[13px] font-medium">{formattedDate}</span>
                        <input
                            type="text"
                            value={todoListTitle}
                            onChange={(e) => setTodoListTitle(e.target.value)}
                            placeholder="Todo List Title"
                            className="text-black text-[22px] font-bold mt-0.5 tracking-tight bg-transparent outline-none w-full placeholder:text-gray-300"
                        />
                    </div>
                    {session?.user?.image ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl overflow-hidden border border-gray-200">
                            👩🏻‍⚕️
                        </div>
                    )}
                </div>

                {/* Calendar Strip */}
                <div className="flex justify-between items-center w-full px-4 py-3 bg-[#F2F2F2]/50 rounded-[20px]">
                    {calendarDays.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-800">{item.day}</span>
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${item.isActive ? 'bg-[#FF734D] text-white shadow-sm' : 'text-gray-600'}`}>
                                <span className="text-[13px] font-medium">{item.date}</span>
                            </div>
                            {item.hasDot ? (
                                <div className={`w-1 h-1 rounded-full ${item.isActive ? 'bg-[#FF734D]' : 'bg-[#FF734D]/40'}`}></div>
                            ) : (
                                <div className="w-1 h-1"></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* List of Tasks */}
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {todoTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between bg-[#F2F2F2]/50 rounded-[20px] p-4">
                            <div className="flex items-center gap-4">
                                <div 
                                    className={`w-6 h-6 rounded border ${task.done ? 'bg-[#58A942] border-[#58A942]' : 'border-gray-300 bg-white'} flex items-center justify-center cursor-pointer`}
                                    onClick={() => setTodoTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                                >
                                    {task.done && <MdDone className="text-white text-sm" />}
                                </div>
                                <span className={`text-[14.5px] font-bold tracking-tight leading-none ${task.done ? 'text-gray-400 line-through' : 'text-black'}`}>
                                    {task.text}
                                </span>
                            </div>
                            <BsThreeDots 
                                className="text-gray-400 text-lg cursor-pointer hover:text-gray-600" 
                                onClick={() => setTodoTasks(prev => prev.filter(t => t.id !== task.id))}
                            />
                        </div>
                    ))}
                    {/* Add new task input */}
                    {isAddingTodo && (
                        <div className="flex flex-col gap-3 bg-white border border-gray-200 shadow-sm rounded-[24px] p-4 mt-1 transition-all">
                            <input
                                autoFocus
                                type="text"
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-transparent outline-none text-sm font-medium px-1 text-black placeholder:text-gray-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTodoTitle.trim()) {
                                        setTodoTasks(prev => [...prev, { id: Date.now().toString(), text: newTodoTitle.trim(), done: false }]);
                                        setIsAddingTodo(false);
                                        setNewTodoTitle('');
                                    }
                                }}
                            />
                            
                            {/* Divider line */}
                            <div className="w-full h-px bg-gray-200"></div>
                            
                            {/* Bottom controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
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
                                    <div className="relative">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="flex h-[40px] cursor-pointer items-center justify-center rounded-[12px] bg-[#0D0D0D]/5 px-4 transition hover:bg-[#0D0D0D]/10"
                                        >
                                            <FluentEmoji emoji={selectedEmoji} size={20} />
                                        </button>
                                        
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 left-0 z-50">
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setShowEmojiPicker(false)}
                                                ></div>
                                                <div className="relative z-50 shadow-xl rounded-lg overflow-hidden border border-gray-100">
                                                    <EmojiPicker 
                                                        onEmojiClick={(emojiData) => {
                                                            setSelectedEmoji(emojiData.emoji);
                                                            setShowEmojiPicker(false);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => {
                                            setIsAddingTodo(false);
                                            setNewTodoTitle('');
                                        }}
                                        className="h-[40px] rounded-[12px] bg-[#0D0D0D]/5 hover:bg-[#0D0D0D]/10 text-black px-4"
                                    >
                                        <RxCross2 />
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (newTodoTitle.trim()) {
                                                setTodoTasks(prev => [...prev, { id: Date.now().toString(), text: newTodoTitle.trim(), done: false }]);
                                                setIsAddingTodo(false);
                                                setNewTodoTitle('');
                                            }
                                        }}
                                        disabled={!newTodoTitle.trim()}
                                        className="h-[40px] rounded-[12px] bg-[#58A942]/10 hover:bg-[#58A942]/15 text-[#58A942] disabled:opacity-50 disabled:cursor-not-allowed px-4 text-sm font-medium flex items-center gap-2"
                                    >
                                        <MdDone className="text-[#58A942] text-lg" />
                                        Done
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save List Button */}
                {todoTasks.length > 0 && (
                    <Button 
                        onClick={handleSaveTodoList}
                        disabled={isSaving}
                        className="w-full h-12 rounded-[16px] bg-black text-white font-semibold mt-2 shadow-md hover:bg-black/90 transition-all"
                    >
                        {isSaving ? <ImSpinner8 className="animate-spin text-xl" /> : 'Save Todo List'}
                    </Button>
                )}

                {/* Navbar within Todo */}
                <div className="flex items-center gap-2 md:gap-4 mt-2">
                    <div className="flex-1 bg-[#F2F2F2]/50 rounded-[32px] p-1.5 md:p-2 flex items-center justify-between">
                        <div className="bg-white rounded-[24px] px-3 py-2 md:px-4 md:py-3 flex items-center gap-1 md:gap-2 shadow-sm">
                            <Home className="text-[16px] md:text-[18px] text-black flex-shrink-0" />
                            <span className="text-xs md:text-sm font-bold text-black tracking-tight">Home</span>
                        </div>
                        {/* Other icons */}
                        <div className="flex items-center gap-3 md:gap-6 pr-2 md:pr-6">
                            {/* Categories */}
                            <Grid className="text-[18px] md:text-[20px] text-black opacity-30 flex-shrink-0" />
                            {/* Document */}
                            <Document className="text-[18px] md:text-[20px] text-black opacity-30 flex-shrink-0" />
                            {/* Calendar */}
                            <Calendar className="text-[18px] md:text-[20px] text-black opacity-30 flex-shrink-0" />
                        </div>
                    </div>
                    {/* Floating Action Button */}
                    <button 
                        onClick={() => setIsAddingTodo(true)}
                        className="w-[46px] h-[46px] md:w-[60px] md:h-[60px] bg-black rounded-full flex-shrink-0 flex items-center justify-center text-white text-2xl md:text-3xl shadow-lg hover:bg-black/90 transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>
        )}

        {/* Conditionally render the transcribe modal based on isTranscribeVisible state */}
        {isTranscribeVisible && (
            <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto min-h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-3">
                {/* Header */}
                <div className="flex justify-between items-center w-full">
                    <span className="text-green-400 font-medium text-sm">Voice Memos</span>
                    <BsThreeDots className="text-xl text-black" />
                </div>

                {/* Waveform area */}
                <div className="w-full h-24 bg-gray-50/50 rounded-full px-8 relative border border-gray-100 flex items-center">
                    <div className="w-full h-full overflow-hidden relative">
                        <div className="absolute inset-y-0 left-0 flex items-center gap-[3px]">
                            {/* Mock active bars */}
                            {[10, 16, 12, 18, 14, 20, 15, 24, 18, 22, 16, 20, 14, 18, 12, 16, 10, 14, 12, 10].map((h, i) => (
                                <div key={`active-${i}`} style={{ height: `${h}px` }} className="w-[2px] min-w-[2px] bg-green-400 rounded-full"></div>
                            ))}
                            
                            {/* Playhead */}
                            <div className="h-16 w-px min-w-[1px] bg-green-400 relative mx-1">
                                <div className="w-2.5 h-2.5 bg-green-400 rounded-full absolute -top-1.5 -translate-x-[4px]"></div>
                            </div>

                            {/* Mock inactive bars */}
                            {[...Array(100)].map((_, i) => (
                                <div key={`inactive-${i}`} className="w-[2px] min-w-[2px] h-1.5 bg-gray-300 rounded-full"></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center w-full pt-2">
                    <span className="text-[32px] font-medium tracking-tight">00:10:04</span>
                    <div className="flex items-center gap-2">
                        <Button className="h-[40px] rounded-full bg-black/5 hover:bg-black/10 text-black px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                            <FaPause className="text-[10px]" />
                            Pause
                        </Button>
                        <Button className="h-[40px] rounded-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                            <FaStop className="text-[10px]" />
                            Stop
                        </Button>
                    </div>
                </div>
            </div>
        )}

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

        <div className="bg-background max-w-[360px] w-full h-[64px] rounded-3xl border border-[#EBEBEB]/50 shadow-md p-2 flex items-center justify-between">
            <Button
                onClick={toggleTodo}
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
                onClick={toggleTranscribe}
                className="h-[48px] rounded-[20px]"
            >
               <RiMic2AiFill className="text-4xl text-green-400" />
                Transcribe
            </Button>
        </div>
    </div>
    )
}

export default TakingNotesButtons;