"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Video,
  Camera,
  Link as LinkIcon,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VideoUploadProps {
  onVideoSelect: (file: File | string) => void;
  isUploading?: boolean;
}

type UploadMethod = "upload" | "record" | "url";

export function VideoUpload({ onVideoSelect, isUploading }: VideoUploadProps) {
  const [method, setMethod] = useState<UploadMethod | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ["video/mp4", "video/webm", "video/quicktime", "video/mov"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload an MP4, WebM, or MOV file");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File size must be less than 100MB");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        setMethod("upload");
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
          videoRef.current.src = URL.createObjectURL(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (method === "upload" && selectedFile) {
      onVideoSelect(selectedFile);
    } else if (method === "record" && recordedBlob) {
      const file = new File([recordedBlob], "recorded-swing.webm", {
        type: "video/webm",
      });
      onVideoSelect(file);
    } else if (method === "url" && videoUrl) {
      onVideoSelect(videoUrl);
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setRecordedBlob(null);
    setVideoUrl("");
    setError(null);
    setMethod(null);
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Method Selection */}
      {!method && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card
            className="p-6 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
            onClick={() => setMethod("upload")}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Upload Video</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  MP4, WebM, MOV
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
            onClick={() => setMethod("record")}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Record Now</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use your camera
                </p>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-200"
            onClick={() => setMethod("url")}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <LinkIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Paste URL</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  YouTube, etc.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {method === "upload" && !selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200",
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/mov"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    Drag & drop your swing video
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or click to browse
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>

            <Button
              variant="ghost"
              className="mt-4"
              onClick={resetSelection}
            >
              ← Back to options
            </Button>
          </motion.div>
        )}

        {/* Recording Area */}
        {method === "record" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted={isRecording}
                controls={!isRecording && !!recordedBlob}
              />

              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-full">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">REC</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4">
              {!isRecording && !recordedBlob && (
                <Button size="lg" onClick={startRecording}>
                  <Camera className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              )}

              {isRecording && (
                <Button size="lg" variant="destructive" onClick={stopRecording}>
                  Stop Recording
                </Button>
              )}

              {recordedBlob && (
                <>
                  <Button variant="outline" onClick={() => {
                    setRecordedBlob(null);
                    startRecording();
                  }}>
                    Re-record
                  </Button>
                  <Button size="lg" onClick={handleSubmit} disabled={isUploading}>
                    <Check className="w-5 h-5 mr-2" />
                    Use This Video
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={resetSelection}
            >
              ← Back to options
            </Button>
          </motion.div>
        )}

        {/* URL Input */}
        {method === "url" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="url"
                placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl border bg-background text-base focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={resetSelection}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={!videoUrl || isUploading}
              >
                <Check className="w-5 h-5 mr-2" />
                Analyze URL
              </Button>
            </div>
          </motion.div>
        )}

        {/* Selected File Preview */}
        {method === "upload" && selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </Card>

            <div className="flex gap-4">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={resetSelection}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-spin mr-2">◌</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Analyze Swing
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Tips */}
      <div className="p-4 rounded-xl bg-muted/50">
        <h4 className="font-semibold text-sm mb-2">Tips for best results:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Film from down-the-line or face-on angle</li>
          <li>• Keep the camera steady (use a tripod if possible)</li>
          <li>• Ensure good lighting and full body visibility</li>
          <li>• Record a single swing (5-15 seconds ideal)</li>
        </ul>
      </div>
    </div>
  );
}
