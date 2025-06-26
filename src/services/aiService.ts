
// OpenAI Whisper for speech-to-text
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'pt');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Whisper API error: ${response.status}`);
  }

  const result = await response.json();
  return result.text;
};

// OpenAI GPT for text generation
export const generateResponse = async (userMessage: string, conversationHistory: Array<{role: string, content: string}>): Promise<string> => {
  const apiKey = localStorage.getItem('openai_api_key');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const messages = [
    {
      role: 'system',
      content: `Você é Liz, uma assistente virtual brasileira amigável e prestativa. 
      Responda de forma natural, calorosa e em português brasileiro. 
      Mantenha as respostas concisas e conversacionais, como se fosse uma conversa face a face.
      Seja expressiva e use um tom acolhedor.`
    },
    ...conversationHistory,
    {
      role: 'user',
      content: userMessage
    }
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`GPT API error: ${response.status}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
};

// ElevenLabs Text-to-Speech
export const generateSpeech = async (text: string): Promise<Blob> => {
  const apiKey = localStorage.getItem('elevenlabs_api_key');
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }

  // Using Sarah voice (Brazilian Portuguese compatible)
  const voiceId = 'EXAVITQu4vr4xnSDxMaL';
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  return await response.blob();
};

// D-ID Avatar Animation
export const generateAvatarVideo = async (audioBlob: Blob): Promise<string> => {
  const apiKey = localStorage.getItem('did_api_key');
  if (!apiKey) {
    throw new Error('D-ID API key not configured');
  }

  // Step 1: Create the talk
  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.mp3');
  
  // Using a default avatar image - you can replace this with your custom Liz image
  const avatarImageUrl = 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg';
  
  const talkData = {
    source_url: avatarImageUrl,
    config: {
      fluent: true,
      stitch: true,
      result_format: 'mp4'
    }
  };

  formData.append('script', JSON.stringify(talkData));

  const createResponse = await fetch('https://api.d-id.com/talks', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${apiKey}`,
    },
    body: formData,
  });

  if (!createResponse.ok) {
    throw new Error(`D-ID API error: ${createResponse.status}`);
  }

  const createResult = await createResponse.json();
  const talkId = createResult.id;

  // Step 2: Poll for the result
  let attempts = 0;
  const maxAttempts = 30; // 60 seconds total
  
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const statusResponse = await fetch(`https://api.d-id.com/talks/${talkId}`, {
      headers: {
        'Authorization': `Basic ${apiKey}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`D-ID status check error: ${statusResponse.status}`);
    }

    const statusResult = await statusResponse.json();
    
    if (statusResult.status === 'done' && statusResult.result_url) {
      return statusResult.result_url;
    }
    
    if (statusResult.status === 'error') {
      throw new Error(`D-ID processing error: ${statusResult.error?.description || 'Unknown error'}`);
    }
    
    attempts++;
  }
  
  throw new Error('D-ID processing timeout');
};

// Main orchestration function
export const processVoiceMessage = async (
  audioBlob: Blob, 
  conversationHistory: Array<{role: string, content: string}>
): Promise<{
  transcription: string;
  response: string;
  videoUrl: string;
}> => {
  console.log('Starting voice message processing...');
  
  // Step 1: Transcribe audio
  console.log('Transcribing audio...');
  const transcription = await transcribeAudio(audioBlob);
  console.log('Transcription:', transcription);
  
  // Step 2: Generate GPT response
  console.log('Generating GPT response...');
  const response = await generateResponse(transcription, conversationHistory);
  console.log('GPT response:', response);
  
  // Step 3: Generate speech
  console.log('Generating speech with ElevenLabs...');
  const speechBlob = await generateSpeech(response);
  console.log('Speech generated, size:', speechBlob.size);
  
  // Step 4: Generate avatar video
  console.log('Generating avatar video with D-ID...');
  const videoUrl = await generateAvatarVideo(speechBlob);
  console.log('Avatar video generated:', videoUrl);
  
  return {
    transcription,
    response,
    videoUrl
  };
};
