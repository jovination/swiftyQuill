"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useNotes, type Note } from "./NotesContext"
import { X, Add, Mic, ArrowUp, Image as ImageIcon, Video, Sparkles, Mic3 } from "reicon-react"
import { LuExpand, LuShrink } from "react-icons/lu"
import { MdDone } from "react-icons/md"
import { RxCross2 } from "react-icons/rx"
import { FaMicrophone, FaPause, FaStop, FaPlay } from "react-icons/fa6"
import { BsThreeDots } from "react-icons/bs"
import { RiDeleteBinLine } from "react-icons/ri"
import { ListTodo, ListCheck, Sparkles as LucideSparkles } from "lucide-react"

interface NotePreviewDialogProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
}

export function NotePreviewDialog({ note, isOpen, onClose }: NotePreviewDialogProps) {
  const { updateNoteOptimistically, toggleActionItemOptimistically } = useNotes()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioKey, setAudioKey] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageKeys, setImageKeys] = useState<string[]>([])
  const [color, setColor] = useState<string | null>(null)
  const [showPalette, setShowPalette] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [pendingAudio, setPendingAudio] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Recording states
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused' | 'done'>('idle')
  const [recordingDuration, setRecordingDuration] = useState(0)
  const recordingDurationRef = useRef(0)
  const [isExpandedRecorder, setIsExpandedRecorder] = useState(false)
  const [waveformHeights, setWaveformHeights] = useState<number[]>([])

  // Preview playback states
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [playbackStatus, setPlaybackStatus] = useState<'idle' | 'playing' | 'paused'>('idle')
  const [playbackProgress, setPlaybackProgress] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll effect refs
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])

  const updateScrollEffect = () => {
    if (!listRef.current) return
    const container = listRef.current
    const scrollTop = container.scrollTop
    const containerHeight = container.clientHeight
    const containerCenterY = scrollTop + containerHeight / 2

    itemRefs.current.forEach((item, idx) => {
      if (!item) return
      
      // Use offsetTop instead of getBoundingClientRect to avoid jitter from transforms
      const itemTop = item.offsetTop
      const itemHeight = item.offsetHeight
      const itemCenterY = itemTop + itemHeight / 2
      
      const distance = Math.abs(containerCenterY - itemCenterY)
      const maxDistance = containerHeight / 1.5
      
      const normalizedDistance = Math.max(0, Math.min(distance / maxDistance, 1))
      
      item.style.transform = `translateY(0px) scale(1)`
      item.style.opacity = `1`
      item.style.zIndex = `10`
    })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(updateScrollEffect, 50)
    }
  }, [isOpen, content])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setAudioUrl(note.audioUrl || null)
      setAudioKey(note.audioKey || null)
      setImageUrls(note.imageUrls || [])
      setImageKeys(note.imageKeys || [])
      setColor(note.color || null)
      setPendingImages([])
      setPendingAudio(null)
      setRecordingStatus('idle')
      setIsExpandedRecorder(false)
      setWaveformHeights([])
      setRecordingDuration(0)
      recordingDurationRef.current = 0
      setPlaybackProgress(0)
      setPlaybackStatus('idle')
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current = null
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [note])

  useEffect(() => {
    if (!isOpen && recordingStatus !== 'idle') {
      handleDiscard()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [content, isOpen])

  // Waveform Animation
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (recordingStatus === 'recording') {
      interval = setInterval(() => {
        setWaveformHeights(prev => {
          const newHeight = isExpandedRecorder ? Math.floor(Math.random() * 24) + 6 : Math.floor(Math.random() * 18) + 6
          const next = [...prev, newHeight]
          const maxBars = isExpandedRecorder ? 60 : 30
          if (next.length > maxBars) return next.slice(next.length - maxBars)
          return next
        })
      }, 100)
    } else if (recordingStatus === 'idle') {
      setWaveformHeights([])
    }
    return () => clearInterval(interval)
  }, [recordingStatus, isExpandedRecorder])

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const handleUpdateRef = useRef<() => void>(() => {})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'BUTTON' || target.isContentEditable
      
      if (e.key === 'Enter' && !isInput) {
        e.preventDefault()
        handleUpdateRef.current()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleUpdate = () => {
    if (!note) return
    if (recordingStatus !== 'idle') {
      handleDiscard()
    }
    updateNoteOptimistically(note.id, {
      title,
      content,
      audioUrl,
      audioKey,
      imageUrls,
      imageKeys,
      color,
      newImages: pendingImages.length > 0 ? pendingImages : undefined,
      newAudio: pendingAudio || undefined,
    })
    onClose()
  }

  handleUpdateRef.current = handleUpdate

  if (!note) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const previewUrls = files.map(f => URL.createObjectURL(f))
    setPendingImages(prev => [...prev, ...files])
    setImageUrls(prev => [...prev, ...previewUrls])
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const toggleTodoList = () => {
    if (content.trim().startsWith('- [')) {
      setContent(content.split('\n').map(line => line.replace(/^- \[[ xX]\] /, '')).join('\n'))
    } else {
      if (content.trim() === '') {
        setContent('- [ ] ')
      } else {
        setContent(content.split('\n').map(line => `- [ ] ${line}`).join('\n'))
      }
    }
  }

  const formatDuration = (seconds: number) => {
    if (!isFinite(seconds) || isNaN(seconds)) return "0:00"
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hrs > 0) return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrlPreview = URL.createObjectURL(blob)
        const audio = new Audio(audioUrlPreview)
        audio.ontimeupdate = () => {
          let dur = audio.duration
          if (!dur || dur === Infinity) dur = recordingDurationRef.current
          if (dur > 0) {
            setPlaybackProgress((audio.currentTime / dur) * 100)
          }
        }
        audio.onended = () => {
          setPlaybackStatus('idle')
          setPlaybackProgress(100)
        }
        audioElementRef.current = audio
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start(200)
      setRecordingStatus('recording')
      setRecordingDuration(0)
      recordingDurationRef.current = 0

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1
          recordingDurationRef.current = next
          return next
        })
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.pause()
      setRecordingStatus('paused')
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'paused') {
      mediaRecorderRef.current.resume()
      setRecordingStatus('recording')
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const next = prev + 1
          recordingDurationRef.current = next
          return next
        })
      }, 1000)
    }
  }

  const handleDiscard = () => {
    if (mediaRecorderRef.current && recordingStatus !== 'idle') {
      mediaRecorderRef.current.stop()
    }
    setRecordingStatus('idle')
    setRecordingDuration(0)
    recordingDurationRef.current = 0
    setPlaybackProgress(0)
    setPlaybackStatus('idle')
    setWaveformHeights([])
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current = null
    }
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
  }

  const finishRecording = () => {
    if (mediaRecorderRef.current && recordingStatus !== 'idle') {
      mediaRecorderRef.current.stop()
      setRecordingStatus('done')
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }

  const togglePlayback = () => {
    if (!audioElementRef.current) return
    if (playbackStatus === 'playing') {
      audioElementRef.current.pause()
      setPlaybackStatus('paused')
    } else {
      if (playbackProgress >= 100) {
        audioElementRef.current.currentTime = 0
      }
      audioElementRef.current.play()
      setPlaybackStatus('playing')
    }
  }

  const handleSaveAudioNote = () => {
    const finalBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    const audioFile = new File([finalBlob], `voice-memo-${Date.now()}.webm`, { type: 'audio/webm' })
    const previewUrl = URL.createObjectURL(finalBlob)
    setAudioUrl(previewUrl)
    setAudioKey(null)
    setPendingAudio(audioFile)
    handleDiscard()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className={`max-w-[550px] w-full max-h-[90vh] flex flex-col p-6 sm:p-8 rounded-[32px] ${color ? 'bg-transparent dark:bg-[#18181A] border-transparent' : 'bg-[#F4F4F5] dark:bg-[#18181A] border-white/40 dark:border-white/10'} shadow-2xl [&>button]:hidden gap-0`}>
        
        {/* Background Layer for Color */}
        {color && (
          <div className="absolute inset-0 rounded-[32px] -z-10 pointer-events-none" style={{ backgroundColor: color }} />
        )}
        
        {/* Accessibility Labels */}
        <DialogTitle className="sr-only">Note Preview</DialogTitle>
        <DialogDescription className="sr-only">View and edit your note details</DialogDescription>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className={`font-bold text-[28px] sm:text-[32px] flex-1 ${color ? 'text-gray-900' : 'text-gray-900 dark:text-gray-100'}`}>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (title.trim() || content.trim()) handleUpdate()
                }
              }}
              className={`bg-transparent w-full outline-none border-none ${color ? 'placeholder-gray-600/60 text-gray-900' : 'placeholder-gray-400'}`}
              placeholder="Note Title"
            />
          </div>
          <button onClick={onClose} className={`p-2 ml-4 -mr-2 rounded-full transition-colors shrink-0 ${color ? 'hover:bg-black/10 text-gray-800' : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 -mx-4 custom-scrollbar min-h-[250px]">
          <div className="flex flex-col gap-5 pb-4 px-1">
            {/* Images/Media Row */}
          {imageUrls.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar relative w-max">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative shrink-0">
                  <img 
                    src={url} 
                    alt={`Attachment ${idx + 1}`} 
                    className="w-[100px] h-[100px] shrink-0 rounded-[22px] object-cover shadow-sm border border-black/5 dark:border-white/5" 
                  />
                  <button 
                    onClick={() => {
                      if (idx < imageKeys.length) {
                        setImageKeys(prev => prev.filter((_, i) => i !== idx))
                      } else {
                        const pendingIndex = idx - imageKeys.length
                        setPendingImages(prev => prev.filter((_, i) => i !== pendingIndex))
                      }
                      setImageUrls(prev => prev.filter((_, i) => i !== idx))
                    }} 
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-black/40 text-white rounded-full hover:bg-black/60 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          


          {/* Text Area */}
          {content.trim().startsWith('- [') ? (
            <div 
              ref={listRef}
              onScroll={updateScrollEffect}
              className="flex flex-col w-full gap-2 mt-1 mb-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1 pb-4 pt-4 relative"
            >
              {content.split('\n').map((line, idx) => {
                const isChecked = line.startsWith('- [x]') || line.startsWith('- [X]');
                const rawText = line.replace(/^- \[[ xX]\] /, '');
                
                return (
                  <div 
                    key={idx} 
                    ref={(el) => { itemRefs.current[idx] = el }}
                    className={`flex items-start gap-3 w-full p-3.5 rounded-2xl transition-all origin-center relative ${color ? 'bg-black/5 dark:bg-black/20' : 'bg-white dark:bg-[#2C2C2E] shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]'} ${isChecked ? 'opacity-50 grayscale-[0.5]' : ''}`}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    <button 
                      onClick={() => {
                        const lines = content.split('\n');
                        lines[idx] = lines[idx].replace(/^- \[[ xX]\]/, isChecked ? '- [ ]' : '- [x]');
                        setContent(lines.join('\n'));
                      }}
                      className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isChecked ? 'bg-[#00b505] border-[#00b505]' : (color ? 'border-gray-500/60 hover:bg-black/10' : 'border-gray-300 dark:border-gray-500 hover:bg-black/5 dark:hover:bg-white/5')}`}
                    >
                      {isChecked && <span className="text-white text-[12px] font-bold">✓</span>}
                    </button>
                    <textarea 
                      value={rawText}
                      onChange={(e) => {
                        const lines = content.split('\n');
                        lines[idx] = `- [${isChecked ? 'x' : ' '}] ${e.target.value}`;
                        setContent(lines.join('\n'));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const lines = content.split('\n');
                          lines.splice(idx + 1, 0, '- [ ] ');
                          setContent(lines.join('\n'));
                        } else if (e.key === 'Backspace' && rawText === '') {
                          e.preventDefault();
                          const lines = content.split('\n');
                          lines.splice(idx, 1);
                          setContent(lines.join('\n'));
                        }
                      }}
                      ref={(el) => {
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      rows={1}
                      className={`w-full bg-transparent border-none outline-none resize-none text-[16px] sm:text-[18px] leading-snug font-medium ${isChecked ? 'text-gray-500 line-through dark:text-gray-400' : (color ? 'text-gray-900' : 'text-gray-800 dark:text-gray-100')}`}
                    />
                  </div>
                )
              })}
              <div className="flex justify-center mt-2 w-full pb-6 relative z-10" style={{ transform: 'translateZ(0)' }}>
                <button
                  onClick={() => setContent(content + (content.endsWith('\n') ? '' : '\n') + '- [ ] ')}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shadow-sm ${color ? 'bg-black/10 text-gray-800 hover:bg-black/20' : 'bg-white dark:bg-[#3A3A3C] text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#4A4A4C] border border-black/5 dark:border-white/5'}`}
                >
                  <Add className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (title.trim() || content.trim()) handleUpdate()
                }
              }}
              placeholder="Write something..."
              className={`w-full text-[20px] sm:text-[22px] leading-snug bg-transparent border-none outline-none resize-none font-medium ${color ? 'placeholder-gray-600/60 text-gray-900' : 'placeholder-gray-400 dark:placeholder-gray-600 text-gray-800 dark:text-gray-100'}`}
              rows={4}
            />
          )}

          {/* Recorder UI */}
          {recordingStatus !== 'idle' && (
            isExpandedRecorder ? (
                <div className="bg-white dark:bg-[#2C2C2E] flex flex-col justify-between w-full h-auto min-h-[212px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[24px] p-5 gap-3 mt-4 relative">
                    {/* Header */}
                    <div className="flex justify-between items-center w-full">
                        <span className={`font-medium text-sm ${recordingStatus === 'recording' ? 'text-[#58A942]' : recordingStatus === 'done' ? 'text-green-400' : 'text-[#58A942]'}`}>
                            {recordingStatus === 'done' ? 'Ready to Attach' : recordingStatus === 'paused' ? 'Recording Paused' : 'Recording...'}
                        </span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsExpandedRecorder(false)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
                                <LuShrink className="text-lg" />
                            </button>
                            <BsThreeDots className="text-xl text-gray-800 dark:text-white ml-2" />
                        </div>
                    </div>

                    {/* Waveform area */}
                    <div className="w-full h-24 bg-[#F4F4F5] dark:bg-[#18181A] rounded-full px-8 relative border border-black/5 dark:border-white/5 flex items-center overflow-hidden">
                        <div className="w-full h-full overflow-hidden relative">
                            <div className="absolute inset-y-0 left-0 flex items-center gap-[3px]">
                                {/* Animated active bars */}
                                {waveformHeights.map((h, i) => (
                                    <div key={`active-${i}`} style={{ height: `${h}px` }} className={`w-[2px] min-w-[2px] rounded-full transition-all duration-100 ${recordingStatus === 'done' ? (((i / waveformHeights.length) * 100) <= playbackProgress ? 'bg-[#58A942]' : 'bg-gray-400/40 dark:bg-gray-600/40') : 'bg-green-400'}`}></div>
                                ))}
                                
                                {/* Playhead */}
                                {recordingStatus !== 'done' && (
                                    <div className="h-16 w-px min-w-[1px] bg-green-400 relative mx-1">
                                        <div className="w-2.5 h-2.5 bg-green-400 rounded-full absolute -top-1.5 -translate-x-[4px]"></div>
                                    </div>
                                )}

                                {/* Mock inactive bars */}
                                {[...Array(100)].map((_, i) => (
                                    <div key={`inactive-${i}`} className="w-[2px] min-w-[2px] h-1.5 bg-gray-400/30 dark:bg-gray-600/30 rounded-full"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center w-full pt-2">
                        <span className={`text-[32px] font-medium tracking-tight ${recordingStatus === 'done' ? 'text-gray-800 dark:text-white' : 'text-[#58A942]'}`}>
                            {recordingStatus === 'done' ? formatDuration(audioElementRef.current?.duration && isFinite(audioElementRef.current.duration) ? audioElementRef.current.duration : recordingDurationRef.current) : formatDuration(recordingDuration)}
                        </span>
                        <div className="flex items-center gap-2">
                            {recordingStatus === 'done' ? (
                                <>
                                    <button onClick={handleDiscard} className="h-[40px] rounded-full bg-[#F4F4F5] dark:bg-[#18181A] hover:opacity-80 text-gray-800 dark:text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <RxCross2 className="text-[14px]" />
                                        Discard
                                    </button>
                                    <button onClick={togglePlayback} className="h-[40px] rounded-full bg-[#F4F4F5] dark:bg-[#18181A] hover:opacity-80 text-gray-800 dark:text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        {playbackStatus === 'playing' ? <FaPause className="text-[12px]" /> : <FaPlay className="text-[12px] ml-0.5" />}
                                    </button>
                                    <button onClick={handleSaveAudioNote} className="h-[40px] rounded-full bg-green-500 hover:bg-green-600 text-white px-6 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <MdDone className="text-[14px] mr-1" />
                                        Attach
                                    </button>
                                </>
                            ) : (
                                <>
                                    {recordingStatus === 'recording' ? (
                                        <button onClick={pauseRecording} className="h-[40px] rounded-full bg-[#F4F4F5] dark:bg-[#18181A] hover:opacity-80 text-gray-800 dark:text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                            <FaPause className="text-[10px]" />
                                            Pause
                                        </button>
                                    ) : (
                                        <button onClick={resumeRecording} className="h-[40px] rounded-full bg-[#F4F4F5] dark:bg-[#18181A] hover:opacity-80 text-gray-800 dark:text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                            <FaPlay className="text-[10px]" />
                                            Resume
                                        </button>
                                    )}
                                    <button onClick={finishRecording} className="h-[40px] rounded-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <FaStop className="text-[10px]" />
                                    </button>
                                    <button onClick={finishRecording} className="h-[40px] rounded-full bg-green-500 hover:bg-green-600 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                        <MdDone className="text-[14px]" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-[#2C2C2E] flex items-center justify-between w-full h-[64px] shadow-[0_4px_5px_rgba(0,0,0,0.04),0_-4px_5px_rgba(0,0,0,0.04),4px_0_5px_rgba(0,0,0,0.04),-4px_0_5px_rgba(0,0,0,0.04)] rounded-[32px] px-5 mb-2 mt-4 relative">
                    {/* Time & Dot */}
                    <div className="flex items-center gap-2 min-w-[50px]">
                        {recordingStatus === 'recording' && <div className="w-2 h-2 rounded-full bg-[#58A942] animate-pulse"></div>}
                        {recordingStatus === 'paused' && <div className="w-2 h-2 rounded-full bg-[#58A942]"></div>}
                        <span className={`text-[15px] font-medium tracking-tight text-[#58A942]`}>
                            {formatDuration(recordingDuration)} 
                        </span>
                    </div>

                    {/* Waveform / Dotted Line */}
                    <div className="flex-1 flex items-center justify-center overflow-hidden h-full px-2 gap-1">
                            <div className="flex items-center gap-[3px] w-full justify-start overflow-hidden">
                                {/* Animated waveform bars filling from left to right */}
                                {waveformHeights.map((h, i) => (
                                    <div key={`wave-${i}`} style={{ height: `${h}px` }} className={`w-[2.5px] min-w-[2.5px] rounded-full transition-all duration-100 ${recordingStatus === 'done' ? (((i / waveformHeights.length) * 100) <= playbackProgress ? 'bg-[#58A942]' : 'bg-[#F4F4F5] dark:bg-[#18181A]') : 'bg-[#58A942]'}`}></div>
                                ))}
                                {/* Dotted line for remaining space */}
                                <div className="flex-1 flex justify-between items-center pl-2 opacity-30">
                                    {[...Array(24)].map((_, i) => <div key={`rec-dot-${i}`} className="w-1 h-1 bg-gray-400 rounded-full"></div>)}
                                </div>
                            </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        {recordingStatus === 'done' ? (
                            <>
                                <button onClick={() => setIsExpandedRecorder(true)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F4F4F5] dark:hover:bg-[#18181A] transition">
                                    <LuExpand className="text-md" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F4F4F5] dark:hover:bg-[#18181A] transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                                </button>
                                <button onClick={togglePlayback} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300 hover:opacity-80 transition">
                                    {playbackStatus === 'playing' ? <FaPause className="text-[12px]" /> : <FaPlay className="text-[12px] ml-0.5" />}
                                </button>
                                <button onClick={handleSaveAudioNote} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition shadow-sm">
                                    <MdDone className="text-[18px]" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F4F4F5] dark:hover:bg-[#18181A] transition">
                                    <RxCross2 className="text-xl" />
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsExpandedRecorder(true)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F4F4F5] dark:hover:bg-[#18181A] transition">
                                    <LuExpand className="text-md" />
                                </button>
                                <button onClick={handleDiscard} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#F4F4F5] dark:hover:bg-[#18181A] transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"></path></svg>
                                </button>
                                {recordingStatus === 'recording' ? (
                                    <button onClick={pauseRecording} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300 hover:opacity-80 transition">
                                        <FaPause className="text-[12px]" />
                                    </button>
                                ) : (
                                    <button onClick={resumeRecording} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300 hover:opacity-80 transition">
                                        <FaPlay className="text-[12px] ml-0.5" />
                                    </button>
                                )}
                                <button onClick={finishRecording} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FF3B30] hover:bg-[#FF3B30]/90 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                    <FaStop className="text-[10px]" />
                                </button>
                                <button onClick={finishRecording} className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-600 text-white px-4 text-sm flex items-center gap-2 shadow-none font-medium">
                                    <MdDone className="text-[14px]" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )
          )}

          {/* Voice Memo */}
          {audioUrl && recordingStatus === 'idle' && (
            <div className={`mb-4 rounded-2xl p-3 flex flex-col gap-3 ${color ? 'bg-black/10' : 'bg-black/5 dark:bg-white/5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${color ? 'bg-white/40 text-gray-800' : 'bg-white dark:bg-[#2C2C2E] text-gray-700 dark:text-gray-300'}`}>
                    <Mic3 className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${color ? 'text-gray-900' : 'text-gray-800 dark:text-gray-200'}`}>Voice Memo attached</span>
                    <span className={`text-xs ${color ? 'text-gray-700' : 'text-gray-500'}`}>Audio ready to play</span>
                  </div>
                </div>
                <button 
                  onClick={() => { setAudioUrl(null); setAudioKey(null) }} 
                  className="text-red-500 hover:text-red-600 w-8 h-8 flex items-center justify-center bg-red-50 dark:bg-red-500/10 rounded-full transition-colors"
                >
                  <RiDeleteBinLine className="text-[18px]" />
                </button>
              </div>
              <audio controls src={audioUrl} className="w-full h-10 opacity-100 transition-all duration-300" />
            </div>
          )}

          {/* AI Action Items Checklist */}
          {note?.actionItems && Array.isArray(note.actionItems) && note.actionItems.length > 0 && (
            <div className={`p-4 rounded-2xl border mb-3 ${color ? 'bg-black/10 border-black/10' : 'bg-surface/80 dark:bg-muted/40 border-black/5 dark:border-white/5'}`}>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                <ListCheck className="w-4 h-4 text-emerald-500" />
                <span>Action Items ({note.actionItems.filter((i: any) => i.completed).length}/{note.actionItems.length})</span>
              </div>
              <div className="flex flex-col gap-2">
                {note.actionItems.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleActionItemOptimistically(note.id, item.id, !item.completed)}
                      className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-400 dark:border-gray-600 bg-white dark:bg-[#2C2C2E]'}`}
                    >
                      {item.completed && <span className="text-[10px] font-bold">✓</span>}
                    </button>
                    <span className={`text-sm ${item.completed ? 'line-through text-muted-foreground' : (color ? 'text-gray-900' : 'text-gray-800 dark:text-gray-200')}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Executive Summary placed at bottom */}
          {note?.summary && (
            <div className={`p-4 rounded-2xl border mt-2 mb-2 ${color ? 'bg-black/10 border-black/10' : 'bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 border-emerald-500/20'}`}>
              <div className="flex items-center justify-between mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <LucideSparkles className="w-4 h-4" />
                  <span>AI Executive Summary</span>
                </div>
                {note.language && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    {note.language}
                  </span>
                )}
              </div>
              <p className={`text-sm leading-relaxed ${color ? 'text-gray-900 font-medium' : 'text-gray-800 dark:text-gray-200'}`}>
                {note.summary}
              </p>
            </div>
          )}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="relative mt-4 sm:mt-8 shrink-0 flex justify-between items-center bg-white dark:bg-[#242426] p-2 rounded-[28px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none dark:border dark:border-white/5">
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

            <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300 hover:brightness-95 transition-all">
              <Add className="w-6 h-6" />
            </button>
            
            <button onClick={() => setShowPalette(!showPalette)} className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300 hover:brightness-95 transition-all">
              <Sparkles className="w-5 h-5" />
            </button>
            
            <button onClick={toggleTodoList} className={`w-12 h-12 flex items-center justify-center rounded-[20px] ${content.trim().startsWith('- [') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-[#F4F4F5] dark:bg-[#18181A] text-gray-600 dark:text-gray-300'} hover:brightness-95 transition-all`}>
              <ListTodo className="w-5 h-5" />
            </button>
            
            {/* Toggle group */}
            <div className="hidden sm:flex bg-[#F4F4F5] dark:bg-[#18181A] rounded-[22px] p-1.5 h-12 items-center ml-1">
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 h-full bg-white dark:bg-[#2C2C2E] rounded-[16px] shadow-sm text-[15px] font-medium text-gray-800 dark:text-gray-100">
                <ImageIcon className="w-4 h-4" />
                Image
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 pr-1">
            <button 
              onClick={() => {
                if (recordingStatus === 'idle') startRecording()
              }}
              className="p-2 transition-colors text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Mic className="w-[22px] h-[22px]" />
            </button>
            <button 
              onClick={handleUpdate}
              className="w-12 h-12 flex items-center justify-center rounded-[20px] bg-[#1C1C1E] text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-md"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
          
          {/* Palette Popover */}
          {showPalette && (
            <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 bg-white dark:bg-[#2C2C2E] p-2 rounded-2xl shadow-xl border border-black/5 dark:border-white/5 flex gap-2 justify-start w-[calc(100%-1rem)] max-w-[450px] overflow-x-auto custom-scrollbar z-10">
              <button 
                onClick={() => { setColor(null); setShowPalette(false) }} 
                className={`w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center shrink-0 transition-transform hover:scale-110 ${color === null ? 'ring-2 ring-offset-2 ring-black dark:ring-offset-[#2C2C2E] dark:ring-white' : ''}`}
              >
                <span className="block w-full h-[2px] bg-red-500 rotate-45"></span>
              </button>
              {[
                "#FFCF7C",
                "#FFA57F",
                "#BD9DFF",
                "#00D9FE",
                "#E7F298",
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#F9C74F",
                "#90BE6D",
              ].map(c => (
                <button 
                  key={c} 
                  onClick={() => { setColor(c); setShowPalette(false) }}
                  className={`w-8 h-8 rounded-full border border-black/10 transition-transform hover:scale-110 shrink-0 ${color === c ? 'ring-2 ring-offset-2 ring-black dark:ring-offset-[#2C2C2E] dark:ring-white' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>
  )
}
