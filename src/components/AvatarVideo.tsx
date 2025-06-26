
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface AvatarVideoProps {
  videoUrl: string;
  onPlay?: () => void;
  onEnded?: () => void;
  isLoading?: boolean;
}

const AvatarVideo: React.FC<AvatarVideoProps> = ({ 
  videoUrl, 
  onPlay, 
  onEnded, 
  isLoading = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.load();
      // Auto-play when new video is loaded
      setTimeout(() => {
        playVideo();
      }, 500);
    }
  }, [videoUrl]);

  const playVideo = async () => {
    if (!videoRef.current) return;
    
    try {
      await videoRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    } catch (error) {
      console.error('Error playing video:', error);
      setError('Erro ao reproduzir vídeo');
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  const handleVideoError = () => {
    setError('Erro ao carregar vídeo');
    setIsPlaying(false);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <div className="aspect-[3/4] relative bg-gradient-to-br from-blue-100 to-indigo-100">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/90 backdrop-blur-sm z-10">
              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
                <p className="text-sm font-medium text-blue-700">Gerando resposta...</p>
                <p className="text-xs text-blue-600">Aguarde alguns instantes</p>
              </div>
            </div>
          )}

          {/* Video Element */}
          {videoUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              onEnded={handleVideoEnded}
              onError={handleVideoError}
              playsInline
              muted={false}
            >
              <source src={videoUrl} type="video/mp4" />
              Seu navegador não suporta vídeo HTML5.
            </video>
          ) : (
            /* Placeholder Avatar */
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-12 w-12 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-900">Liz AI</h3>
                  <p className="text-sm text-blue-600">Assistente Virtual</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Controls Overlay */}
          {videoUrl && !isLoading && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button
                onClick={isPlaying ? pauseVideo : playVideo}
                size="sm"
                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Status Indicator */}
          <div className="absolute top-4 right-4">
            <div className={`w-3 h-3 rounded-full ${
              isPlaying ? 'bg-green-400 animate-pulse' : 
              isLoading ? 'bg-yellow-400 animate-pulse' : 
              'bg-gray-300'
            }`} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}
      </Card>

      {/* Status Text */}
      <div className="mt-3 text-center">
        <p className="text-sm text-gray-600">
          {isLoading ? 'Processando...' : 
           isPlaying ? 'Liz está falando' : 
           videoUrl ? 'Pronto para reproduzir' : 
           'Aguardando comando de voz'}
        </p>
      </div>
    </div>
  );
};

export default AvatarVideo;
