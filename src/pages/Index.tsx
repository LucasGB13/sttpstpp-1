
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Settings, Send, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AudioCapture from '@/components/AudioCapture';
import AvatarVideo from '@/components/AvatarVideo';
import ConfigPanel from '@/components/ConfigPanel';
import ChatHistory from '@/components/ChatHistory';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
}

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handleAudioCapture = async (audioBlob: Blob) => {
    console.log('Audio captured, processing...', audioBlob.size, 'bytes');
    setIsProcessing(true);
    
    try {
      // Add user message placeholder
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: '🎤 Processando áudio...',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Simulate API processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user message with transcription
      const transcription = 'Olá, como você está hoje?';
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id 
          ? { ...msg, content: transcription }
          : msg
      ));

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Olá! Estou muito bem, obrigada por perguntar. Como posso ajudá-la hoje?',
        timestamp: new Date(),
        videoUrl: '/placeholder-avatar-video.mp4' // Placeholder for D-ID generated video
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentVideoUrl(assistantMessage.videoUrl || '');
      
      toast({
        title: "Resposta processada",
        description: "Avatar está respondendo...",
      });
      
    } catch (error) {
      console.error('Error processing audio:', error);
      toast({
        title: "Erro no processamento",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="border-b border-blue-100 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border-2 border-blue-200">
                <AvatarImage src="/placeholder-avatar.png" alt="Liz Avatar" />
                <AvatarFallback className="bg-blue-100 text-blue-600">LZ</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Liz AI Assistant</h1>
                <div className="flex items-center space-x-2">
                  <Badge variant={isPlaying ? "default" : "secondary"} className="text-xs">
                    {isPlaying ? "Falando" : "Ouvindo"}
                  </Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="border-blue-200 hover:bg-blue-50"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar and Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Avatar Video */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <div className="text-center space-y-4">
                <h2 className="text-lg font-medium text-gray-900">Avatar Liz</h2>
                <AvatarVideo
                  videoUrl={currentVideoUrl}
                  onPlay={handleVideoPlay}
                  onEnded={handleVideoEnd}
                  isLoading={isProcessing}
                />
              </div>
            </Card>

            {/* Audio Controls */}
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Controles de Áudio</h3>
                  <div className="flex items-center space-x-2">
                    {isProcessing && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-blue-600">Processando...</span>
                      </>
                    )}
                  </div>
                </div>
                
                <AudioCapture
                  onAudioCapture={handleAudioCapture}
                  isProcessing={isProcessing}
                />
                
                <div className="flex items-center justify-center space-x-4 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Volume2 className="h-4 w-4" />
                    <span>Clique e mantenha pressionado para falar</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat History and Config */}
          <div className="space-y-6">
            {showConfig && (
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
                <ConfigPanel />
              </Card>
            )}
            
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg">
              <ChatHistory messages={messages} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
