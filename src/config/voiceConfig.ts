
// Configurações de voz para ElevenLabs
export const VOICE_CONFIG = {
  // Vozes disponíveis em português brasileiro
  voices: {
    sarah: {
      id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah',
      description: 'Voz feminina natural, ideal para português brasileiro'
    },
    aria: {
      id: '9BWtsMINqrJLrRacOk9x', 
      name: 'Aria',
      description: 'Voz feminina expressiva'
    },
    charlotte: {
      id: 'XB0fDUnXU5powFXDhCwa',
      name: 'Charlotte', 
      description: 'Voz feminina suave'
    }
  },
  
  // Voz padrão da Liz
  defaultVoice: 'sarah',
  
  // Configurações de modelo e parâmetros
  model: 'eleven_multilingual_v2',
  settings: {
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.3,
    use_speaker_boost: true
  }
};

// Avatar padrão para D-ID
export const AVATAR_CONFIG = {
  defaultImage: 'https://create-images-results.d-id.com/DefaultPresenters/Noelle_f/image.jpeg',
  config: {
    fluent: true,
    stitch: true,
    result_format: 'mp4',
    align_driver: true,
    auto_match: true
  }
};
