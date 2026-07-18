"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { TbCapture } from "react-icons/tb";
import { BiEditAlt } from "react-icons/bi";
import { Home, Grid, Document, Calendar } from "reicon-react";
import { LuListTodo, LuExpand, LuShrink } from "react-icons/lu";
import { MdDone } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FaMicrophone, FaPause, FaStop, FaPlay } from "react-icons/fa6";
import { BsThreeDots } from "react-icons/bs";
import { ImSpinner8 } from "react-icons/im";
import { RiMic2AiFill } from "react-icons/ri";
import { toast } from "sonner";
import { FluentEmoji } from '@lobehub/fluent-emoji';
import EmojiPicker from 'emoji-picker-react';
import { useSession } from "next-auth/react";
import { useNotes } from './NotesContext';

interface NoteData {
    title: string;
    content: string;
    imageUrl: string | null;
}

function TakingNotesButtons(){
    const { notes, addNoteOptimistically } = useNotes();
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
    const [todoImageUrl, setTodoImageUrl] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close modals when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isInputVisible) setIsInputVisible(false);
                if (isTranscribeVisible) setIsTranscribeVisible(false);
                if (isTodoVisible) setIsTodoVisible(false);
            }
        };

        if (isInputVisible || isTranscribeVisible || isTodoVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isInputVisible, isTranscribeVisible, isTodoVisible]);

    // Recording states
    const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'done'>('idle');
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingDurationRef = useRef(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isExpandedRecorder, setIsExpandedRecorder] = useState(false);
    
    // Preview playback states
    const audioElementRef = useRef<HTMLAudioElement | null>(null);
    const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
    const [playbackProgress, setPlaybackProgress] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [waveformHeights, setWaveformHeights] = useState<number[]>([]);

    // Waveform Animation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (recordingStatus === 'recording') {
            interval = setInterval(() => {
                setWaveformHeights(prev => {
                    const newHeight = isExpandedRecorder ? Math.floor(Math.random() * 24) + 6 : Math.floor(Math.random() * 18) + 6;
                    const next = [...prev, newHeight];
                    const maxBars = isExpandedRecorder ? 60 : 30;
                    if (next.length > maxBars) return next.slice(next.length - maxBars);
                    return next;
                });
            }, 100);
        } else if (recordingStatus === 'idle') {
            setWaveformHeights([]);
        }
        return () => clearInterval(interval);
    }, [recordingStatus, isExpandedRecorder]);

    // Cleanup recording on unmount
    useEffect(() => {
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                
                // Initialize preview player
                const audioUrl = URL.createObjectURL(blob);
                const audio = new Audio(audioUrl);
                audio.ontimeupdate = () => {
                    let dur = audio.duration;
                    if (!dur || dur === Infinity) dur = recordingDurationRef.current;
                    if (dur > 0) {
                        setPlaybackProgress((audio.currentTime / dur) * 100);
                    }
                };
                audio.onended = () => {
                    setPlaybackStatus('idle');
                    setPlaybackProgress(100);
                };
                audioElementRef.current = audio;

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start(200);
            setRecordingStatus('recording');
            setRecordingDuration(0);
            recordingDurationRef.current = 0;

            timerIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => {
                    const next = prev + 1;
                    recordingDurationRef.current = next;
                    return next;
                });
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast.error('Microphone access denied or unavailable.');
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'recording') {
            mediaRecorderRef.current.pause();
            setRecordingStatus('paused');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && recordingStatus === 'paused') {
            mediaRecorderRef.current.resume();
            setRecordingStatus('recording');
            timerIntervalRef.current = setInterval(() => {
                setRecordingDuration(prev => {
                    const next = prev + 1;
                    recordingDurationRef.current = next;
                    return next;
                });
            }, 1000);
        }
    };

    const handleDiscard = () => {
        if (mediaRecorderRef.current && recordingStatus !== 'idle') {
            mediaRecorderRef.current.stop();
        }
        setRecordingStatus('idle');
        setRecordingDuration(0);
        recordingDurationRef.current = 0;
        setAudioBlob(null);
        setPlaybackProgress(0);
        setPlaybackStatus('idle');
        setWaveformHeights([]);
        if (audioElementRef.current) {
            audioElementRef.current.pause();
            audioElementRef.current = null;
        }
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };

    const finishRecording = () => {
        if (mediaRecorderRef.current && recordingStatus !== 'idle') {
            mediaRecorderRef.current.stop();
            setRecordingStatus('done');
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
    };

    const togglePlayback = () => {
        if (!audioElementRef.current) return;
        if (playbackStatus === 'playing') {
            audioElementRef.current.pause();
            setPlaybackStatus('paused');
        } else {
            if (playbackProgress >= 100) {
                audioElementRef.current.currentTime = 0;
            }
            audioElementRef.current.play();
            setPlaybackStatus('playing');
        }
    };

    const formatDuration = (seconds: number) => {
        if (!isFinite(seconds) || isNaN(seconds)) return "00:00";
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSaveAudioNote = async () => {
        if (!mediaRecorderRef.current && !audioBlob) return;

        try {
            let finalBlob = audioBlob;
            if (recordingStatus === 'recording' || recordingStatus === 'paused') {
                mediaRecorderRef.current?.stop();
                finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            }
            
            if (audioElementRef.current) {
                audioElementRef.current.pause();
            }

            if (!finalBlob) {
                toast.error("No audio recorded.");
                return;
            }

            // Convert to base64 for the audio URL
            const reader = new FileReader();
            reader.readAsDataURL(finalBlob);
            reader.onloadend = () => {
                const base64data = reader.result as string;

                const voiceMemoNumbers = notes
                    .map(n => n.title.match(/^Voice Memo (\d+)$/))
                    .filter(match => match !== null)
                    .map(match => parseInt(match![1], 10));
                const nextNumber = voiceMemoNumbers.length > 0 ? Math.max(...voiceMemoNumbers) + 1 : 1;
                const newTitle = `Voice Memo ${nextNumber}`;

                // Optimistically add note — closes UI instantly
                addNoteOptimistically({
                    title: newTitle,
                    content: 'Voice Memo audio attached.',
                    audioUrl: base64data,
                    imageUrl: null,
                });
            };

            // Reset recorder UI immediately
            setIsTranscribeVisible(false);
            setRecordingStatus('idle');
            setWaveformHeights([]);
            setRecordingDuration(0);
            recordingDurationRef.current = 0;
            setAudioBlob(null);
            setPlaybackProgress(0);
            setPlaybackStatus('idle');
            if (audioElementRef.current) {
                audioElementRef.current = null;
            }
        } catch (error) {
            console.error(error);
            toast.error('Error saving voice memo.');
        }
    };

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

    const handleSaveNote = () => {
        if (!noteData.title.trim() && !noteData.content.trim()) return;
        
        // Optimistically add note — appears in list instantly
        addNoteOptimistically({
            title: noteData.title,
            content: noteData.content,
            imageUrl: noteData.imageUrl,
        });
        
        // Reset form and close immediately
        setNoteData({
            title: '',
            content: '',
            imageUrl: null
        });
        setIsInputVisible(false);
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

    const handleSaveTodoList = () => {
        if (!todoListTitle.trim() || todoTasks.length === 0) {
            toast.error('Please add a title and at least one task');
            return;
        }

        const formattedContent = todoTasks.map(task => `- [${task.done ? 'x' : ' '}] ${task.text}`).join('\n');
        
        // Optimistically add todo list — appears in list instantly
        addNoteOptimistically({
            title: todoListTitle,
            content: formattedContent,
            imageUrl: todoImageUrl,
        });
        
        // Reset and close immediately
        setTodoListTitle('');
        setTodoTasks([]);
        setTodoImageUrl(null);
        setSelectedEmoji('😀');
        setShowEmojiPicker(false);
        setIsTodoVisible(false);
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

    const handleTodoImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setTodoImageUrl(imageUrl);
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
    <div ref={containerRef} className="w-full  flex flex-col items-center gap-4">
        {/* Conditionally render the Todo modal based on isTodoVisible state */}
        {isTodoVisible && (
            <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-4">
                {/* Header */}
                <div className="flex justify-between items-start w-full">
                    <div className="flex flex-col flex-1 mr-4">
                        <span className="text-muted-foreground text-[13px] font-medium">{formattedDate}</span>
                        <input
                            type="text"
                            value={todoListTitle}
                            onChange={(e) => setTodoListTitle(e.target.value)}
                            placeholder="Todo List Title"
                            className="text-foreground text-[22px] font-bold mt-0.5 tracking-tight bg-transparent outline-none w-full placeholder:text-muted-foreground/50"
                        />
                    </div>
                    {session?.user?.image ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-border">
                            <img src={session.user.image} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl overflow-hidden border border-border">
                            👩🏻‍⚕️
                        </div>
                    )}
                </div>

                {/* Calendar Strip */}
                <div className="flex justify-between items-center w-full px-4 py-3 bg-muted/50 rounded-[20px]">
                    {calendarDays.map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-1.5">
                            <span className="text-xs font-semibold text-foreground">{item.day}</span>
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full ${item.isActive ? 'bg-[#FF734D] text-white shadow-sm' : 'text-muted-foreground'}`}>
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
                        <div key={task.id} className="flex items-center justify-between bg-muted/50 rounded-[20px] p-4">
                            <div className="flex items-center gap-4">
                                <div 
                                    className={`w-6 h-6 rounded border ${task.done ? 'bg-[#58A942] border-[#58A942]' : 'border-border bg-card'} flex items-center justify-center cursor-pointer`}
                                    onClick={() => setTodoTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                                >
                                    {task.done && <MdDone className="text-white text-sm" />}
                                </div>
                                <span className={`text-[14.5px] font-bold tracking-tight leading-none ${task.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {task.text}
                                </span>
                            </div>
                            <BsThreeDots 
                                className="text-muted-foreground text-lg cursor-pointer hover:text-foreground" 
                                onClick={() => setTodoTasks(prev => prev.filter(t => t.id !== task.id))}
                            />
                        </div>
                    ))}
                    {/* Add new task input */}
                    {isAddingTodo && (
                        <div className="flex flex-col gap-3 bg-card border border-border shadow-sm rounded-[24px] p-4 mt-1 transition-all">
                            <input
                                autoFocus
                                type="text"
                                value={newTodoTitle}
                                onChange={(e) => setNewTodoTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full bg-transparent outline-none text-sm font-medium px-1 text-foreground placeholder:text-muted-foreground"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && newTodoTitle.trim()) {
                                        setTodoTasks(prev => [...prev, { id: Date.now().toString(), text: newTodoTitle.trim(), done: false }]);
                                        setIsAddingTodo(false);
                                        setNewTodoTitle('');
                                        setSelectedEmoji('😀');
                                    }
                                }}
                            />
                            
                            {/* Image preview if uploaded */}
                            {todoImageUrl && (
                                <div className="relative inline-block">
                                    <img 
                                        src={todoImageUrl} 
                                        alt="Task attachment" 
                                        className="max-w-full h-auto max-h-24 rounded-lg object-cover border border-border"
                                    />
                                    <button
                                        onClick={() => setTodoImageUrl(null)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            
                            {/* Divider line */}
                            <div className="w-full h-px bg-border"></div>
                            
                            {/* Bottom controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <label className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-muted px-4 text-foreground transition hover:bg-muted/80">
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
                                            onChange={handleTodoImageUpload}
                                        />
                                    </label>
                                    <div className="relative">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="flex h-[40px] cursor-pointer items-center justify-center rounded-[12px] bg-muted px-4 transition hover:bg-muted/80"
                                        >
                                            <FluentEmoji emoji={selectedEmoji} size={20} />
                                        </button>
                                        
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-12 left-0 z-50">
                                                <div 
                                                    className="fixed inset-0 z-40" 
                                                    onClick={() => setShowEmojiPicker(false)}
                                                ></div>
                                                <div className="relative z-50 shadow-xl rounded-lg overflow-hidden border border-border">
                                                    <EmojiPicker 
                                                        onEmojiClick={(emojiData) => {
                                                            setSelectedEmoji(emojiData.emoji);
                                                            setNewTodoTitle(prev => prev + emojiData.emoji);
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
                                            setSelectedEmoji('😀');
                                            setTodoImageUrl(null);
                                        }}
                                        className="h-[40px] rounded-[12px] bg-muted hover:bg-muted/80 text-foreground px-4"
                                    >
                                        <RxCross2 />
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (newTodoTitle.trim()) {
                                                setTodoTasks(prev => [...prev, { id: Date.now().toString(), text: newTodoTitle.trim(), done: false }]);
                                                setIsAddingTodo(false);
                                                setNewTodoTitle('');
                                                setSelectedEmoji('😀');
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
                        className="w-full h-12 rounded-[16px] bg-primary text-primary-foreground font-semibold mt-2 shadow-md hover:bg-primary/90 transition-all"
                    >
                        {isSaving ? <ImSpinner8 className="animate-spin text-xl" /> : 'Save Todo List'}
                    </Button>
                )}

                {/* Navbar within Todo */}
                <div className="flex items-center gap-2 md:gap-4 mt-2">
                    <div className="flex-1 bg-muted/50 rounded-[32px] p-1.5 md:p-2 flex items-center justify-between">
                        <div className="bg-card rounded-[24px] px-3 py-2 md:px-4 md:py-3 flex items-center gap-1 md:gap-2 shadow-sm">
                            <Home className="text-[16px] md:text-[18px] text-foreground flex-shrink-0" />
                            <span className="text-xs md:text-sm font-bold text-foreground tracking-tight">Home</span>
                        </div>
                        {/* Other icons */}
                        <div className="flex items-center gap-3 md:gap-6 pr-2 md:pr-6">
                            {/* Categories */}
                            <Grid className="text-[18px] md:text-[20px] text-foreground opacity-30 flex-shrink-0" />
                            {/* Document */}
                            <Document className="text-[18px] md:text-[20px] text-foreground opacity-30 flex-shrink-0" />
                            {/* Calendar */}
                            <Calendar className="text-[18px] md:text-[20px] text-foreground opacity-30 flex-shrink-0" />
                        </div>
                    </div>
                    {/* Floating Action Button */}
                    <button 
                        onClick={() => setIsAddingTodo(true)}
                        className="w-[46px] h-[46px] md:w-[60px] md:h-[60px] bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-primary-foreground text-2xl md:text-3xl shadow-lg hover:bg-primary/90 transition-colors"
                    >
                        +
                    </button>
                </div>
            </div>
        )}

        {/* Conditionally render the transcribe modal based on isTranscribeVisible state */}
        {isTranscribeVisible && (
            isExpandedRecorder ? (
                <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto min-h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-3 mb-2 relative">
                    {/* Header */}
                    <div className="flex justify-between items-center w-full">
                        <span className="text-green-400 font-medium text-sm">
                            {recordingStatus === 'idle' ? 'Voice Memos' : recordingStatus === 'done' ? 'Ready to Transcribe' : 'Recording...'}
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsExpandedRecorder(false)} className="text-gray-400 hover:text-black transition">
                                <LuShrink className="text-lg" />
                            </button>
                            <BsThreeDots className="text-xl text-black ml-2" />
                        </div>
                    </div>

                    {/* Waveform area */}
                    <div className="w-full h-24 bg-gray-50/50 rounded-full px-8 relative border border-gray-100 flex items-center overflow-hidden">
                        <div className="w-full h-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 flex items-center gap-[3px]">
                                {/* Animated active bars */}
                                {waveformHeights.map((h, i) => (
                                    <div key={`active-${i}`} style={{ height: `${h}px` }} className={`w-[2px] min-w-[2px] rounded-full transition-all duration-100 ${recordingStatus === 'done' ? (((i / waveformHeights.length) * 100) <= playbackProgress ? 'bg-[#58A942]' : 'bg-gray-300') : 'bg-green-400'}`}></div>
                                ))}
                                
                                {/* Playhead */}
                                {recordingStatus !== 'idle' && recordingStatus !== 'done' && (
                                    <div className="h-16 w-px min-w-[1px] bg-green-400 relative mx-1">
                                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full absolute -top-1.5 -translate-x-[4px]"></div>
                                    </div>
                                )}

                                {/* Mock inactive bars */}
                                {[...Array(100)].map((_, i) => (
                                    <div key={`inactive-${i}`} className="w-[2px] min-w-[2px] h-1.5 bg-gray-300 rounded-full"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center w-full pt-2">
                        <span className="text-[32px] font-medium tracking-tight">
                            {recordingStatus === 'done' ? formatDuration(Math.floor((audioElementRef.current?.duration && isFinite(audioElementRef.current.duration) ? audioElementRef.current.duration : recordingDurationRef.current) * (playbackProgress / 100))) : formatDuration(recordingDuration)}
                        </span>
                        <div className="flex items-center gap-2">
                            {recordingStatus === 'idle' ? (
                                <Button onClick={startRecording} className="h-[40px] rounded-full bg-green-500 hover:bg-green-600 text-white px-6 text-sm flex items-center gap-2 shadow-none font-medium">
                                    <FaMicrophone className="text-[12px]" />
                                    Start
                                </Button>
                            ) : recordingStatus === 'done' ? (
                                <>
                                    <Button onClick={handleDiscard} className="h-[40px] rounded-full bg-black/5 hover:bg-black/10 text-black px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <RxCross2 className="text-[14px]" />
                                        Discard
                                    </Button>
                                    <Button onClick={togglePlayback} className="h-[40px] rounded-full bg-black/5 hover:bg-black/10 text-black px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        {playbackStatus === 'playing' ? <FaPause className="text-[12px]" /> : <FaPlay className="text-[12px] ml-0.5" />}
                                    </Button>
                                    <Button onClick={handleSaveAudioNote} disabled={isSaving} className="h-[40px] rounded-full bg-green-500 hover:bg-green-600 text-white px-6 text-sm flex items-center gap-2 shadow-none font-medium disabled:opacity-50">
                                        {isSaving ? <ImSpinner8 className="animate-spin text-sm mr-1" /> : <MdDone className="text-[14px] mr-1" />}
                                        Save
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {recordingStatus === 'recording' ? (
                                        <Button onClick={pauseRecording} className="h-[40px] rounded-full bg-black/5 hover:bg-black/10 text-black px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                            <FaPause className="text-[10px]" />
                                            Pause
                                        </Button>
                                    ) : (
                                        <Button onClick={resumeRecording} className="h-[40px] rounded-full bg-black/5 hover:bg-black/10 text-black px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                            <FaPlay className="text-[10px]" />
                                            Resume
                                        </Button>
                                    )}
                                    <Button onClick={finishRecording} className="h-[40px] rounded-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <FaStop className="text-[10px]" />
                                    </Button>
                                    <Button onClick={finishRecording} className="h-[40px] rounded-full bg-green-500 hover:bg-green-600 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <MdDone className="text-[14px]" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-background flex items-center justify-between w-[360px] md:w-[440px] h-[64px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[32px] px-5 mb-2 relative">
                    {/* Time & Dot */}
                    <div className="flex items-center gap-2 min-w-[50px]">
                        {recordingStatus === 'recording' && <div className="w-2 h-2 rounded-full bg-[#58A942] animate-pulse"></div>}
                        {recordingStatus === 'paused' && <div className="w-2 h-2 rounded-full bg-[#58A942]"></div>}
                        <span className={`text-[15px] font-medium tracking-tight ${recordingStatus !== 'idle' ? 'text-[#58A942]' : 'text-gray-500'}`}>
                            {recordingStatus === 'idle' ? '0:00' : formatDuration(recordingDuration).replace(/^00:/, '')} 
                        </span>
                    </div>

                    {/* Waveform / Dotted Line */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full px-2 gap-1">
                        {recordingStatus === 'idle' ? (
                            <div className="w-full flex justify-between items-center opacity-30">
                                 {[...Array(24)].map((_, i) => <div key={`idle-dot-${i}`} className="w-1 h-1 bg-gray-400 rounded-full"></div>)}
                            </div>
                        ) : (
                            <div className="flex items-center gap-[3px] w-full justify-start overflow-hidden">
                                {/* Animated waveform bars filling from left to right */}
                                {waveformHeights.map((h, i) => (
                                    <div key={`wave-${i}`} style={{ height: `${h}px` }} className={`w-[2.5px] min-w-[2.5px] rounded-full transition-all duration-100 ${recordingStatus === 'done' ? (((i / waveformHeights.length) * 100) <= playbackProgress ? 'bg-[#58A942]' : 'bg-gray-300') : 'bg-[#58A942]'}`}></div>
                                ))}
                                {/* Dotted line for remaining space */}
                                <div className="flex-1 flex justify-between items-center pl-2 opacity-30">
                                    {[...Array(24)].map((_, i) => <div key={`rec-dot-${i}`} className="w-1 h-1 bg-gray-400 rounded-full"></div>)}
                                </div>au
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {recordingStatus === 'idle' ? (
                            <>
                                <button onClick={() => setIsExpandedRecorder(true)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <LuExpand className="text-md" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                                </button>
                                <button onClick={startRecording} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-sm">
                                    <FaPlay className="text-[14px] ml-0.5" />
                                </button>
                                <button onClick={() => setIsTranscribeVisible(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <RxCross2 className="text-xl" />
                                </button>
                            </>
                        ) : recordingStatus === 'done' ? (
                            <>
                                <button onClick={() => setIsExpandedRecorder(true)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <LuExpand className="text-md" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                                </button>
                                <button onClick={togglePlayback} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                    {playbackStatus === 'playing' ? <FaPause className="text-[12px]" /> : <FaPlay className="text-[12px] ml-0.5" />}
                                </button>
                                <button onClick={handleSaveAudioNote} disabled={isSaving} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-sm disabled:opacity-50">
                                    {isSaving ? <ImSpinner8 className="animate-spin text-sm" /> : <MdDone className="text-[18px]" />}
                                </button>
                                <button onClick={() => setIsTranscribeVisible(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <RxCross2 className="text-xl" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsExpandedRecorder(true)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <LuExpand className="text-md" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                                </button>
                                {recordingStatus === 'recording' ? (
                                    <button onClick={pauseRecording} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                        <FaPause className="text-[12px]" />
                                    </button>
                                ) : (
                                    <button onClick={resumeRecording} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                                        <FaPlay className="text-[12px] ml-0.5" />
                                    </button>
                                )}
                                <button onClick={finishRecording} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-sm">
                                    <MdDone className="text-[18px]" />
                                </button>
                                <button onClick={() => setIsTranscribeVisible(false)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition">
                                    <RxCross2 className="text-xl" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )
        )}

        {/* Conditionally render the input field based on isInputVisible state */}
        {isInputVisible && (
            <div className="inputfield bg-background flex flex-col justify-between w-[360px] md:w-[440px] h-auto min-h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-3">
                {/* Title Input */}
                <input
                    type="text"
                    value={noteData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full text-md font-medium outline-none bg-transparent border-none placeholder:text-muted-foreground placeholder:font-medium"
                    placeholder="Note title..."
                />
                
                {/* Divider line */}
                <div className="w-full h-px bg-border"></div>
                
                {/* Content Textarea */}
                <textarea 
                    value={noteData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    className="w-full h-24 outline-none bg-transparent resize-none placeholder:text-muted-foreground text-sm" 
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
                    <label className="flex h-[40px] cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-muted px-4 text-foreground transition hover:bg-muted/80">
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
                            className="h-[40px] rounded-[12px] bg-muted hover:bg-muted/80 text-foreground"
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

        <div className="bg-background max-w-[360px] w-full h-[64px] rounded-3xl border border-border shadow-md p-2 flex items-center justify-between">
            <Button
                onClick={toggleTodo}
                className="h-[48px] rounded-[20px] bg-muted text-foreground hover:bg-muted/80"
            >
                <LuListTodo />
                Todos
            </Button>

            <Button
                onClick={toggleInputField}
                className="h-[48px] rounded-[20px] bg-muted text-foreground hover:bg-muted/80"
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