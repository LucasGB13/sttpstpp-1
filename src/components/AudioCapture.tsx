
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AudioCaptureProps {
  onAudioCapture: (audioBlob: Blob) => void;
  isProcessing: boolean;
}

const AudioCapture: React.FC<AudioCaptureProps> = ({ onAudioCapture, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number>(0);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Setup audio analysis for visual feedback
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      audioChunks.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        console.log('Recording stopped, blob size:', audioBlob.size);
        onAudioCapture(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      recorder.start(100); // Collect data every 100ms
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start audio level monitoring
      monitorAudioLevel();
      
      toast({
        title: "Gravação iniciada",
        description: "Fale agora, sua voz está sendo capturada.",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Erro ao acessar microfone",
        description: "Verifique as permissões do navegador.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      toast({
        title: "Gravação finalizada",
        description: "Processando sua mensagem...",
      });
    }
  };

  const monitorAudioLevel = () => {
    if (!analyser.current) return;
    
    const dataArray = new Uint8Array(analyser.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyser.current || !isRecording) return;
      
      analyser.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      setAudioLevel(average / 255 * 100);
      
      animationFrame.current = requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Audio Level Indicator */}
      {isRecording && (
        <div className="w-full max-w-xs">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Nível do áudio:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Recording Button */}
      <div className="relative">
        <Button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isProcessing}
          className={`w-20 h-20 rounded-full transition-all duration-200 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 scale-110' 
              : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200'
          }`}
        >
          {isRecording ? (
            <Square className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </Button>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute -top-1 -right-1">
            <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-gray-700">
          {isRecording ? 'Solte para parar' : 'Pressione e segure para falar'}
        </p>
        <p className="text-xs text-gray-500">
          {isRecording ? '🔴 Gravando...' : '🎤 Pronto para gravar'}
        </p>
      </div>
    </div>
  );
};

export default AudioCapture;
