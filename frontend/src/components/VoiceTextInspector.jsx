import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, Volume2, ShieldAlert, Sparkles, VolumeX } from 'lucide-react';

export default function VoiceTextInspector({ onResultReceived }) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Web Speech Recognition setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn("Speech recognition API not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser. Please type your query in the text box.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Supports Indian Accent & English/Hinglish

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setInputText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleInspect = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    setEvaluating(true);
    try {
      const res = await fetch('/api/v1/voice-text-inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputText })
      });
      const data = await res.json();
      setAiResponse(data);
      setEvaluating(false);

      if (onResultReceived && data.risk_evaluation) {
        onResultReceived(data.risk_evaluation);
      }

      // Automatically speak out the AI Voice Transcript
      if (data.voice_response_transcript) {
        speakText(data.voice_response_transcript);
      }
    } catch (err) {
      console.error("Error inspecting voice/text query:", err);
      setEvaluating(false);
    }
  };

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any existing audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-IN';

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-rzp-blue/40 glow-blue space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-rzp-blue/20 text-rzp-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Real-Time Voice & Text AI Inspector</h3>
            <p className="text-xs text-slate-400">Speak or type any transaction query in natural language</p>
          </div>
        </div>

        {isPlayingAudio && (
          <button
            onClick={stopAudio}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-semibold animate-pulse"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Stop Audio Playback</span>
          </button>
        )}
      </div>

      {/* Input Box with Microphone & Send Button */}
      <form onSubmit={handleInspect} className="relative">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type: 'Evaluate COD order ₹35,000 with address changed 2 hours ago'..."
          className="w-full pl-4 pr-24 py-3.5 rounded-xl bg-rzp-dark border border-rzp-border text-white text-xs placeholder:text-slate-500 focus:border-rzp-blue outline-none"
        />

        <div className="absolute right-2 top-2 flex items-center space-x-1.5">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-lg transition ${
              isListening
                ? 'bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/50'
                : 'bg-rzp-panel text-slate-400 hover:text-rzp-accent hover:bg-rzp-border'
            }`}
            title={isListening ? "Listening... Click to stop" : "Speak Voice Input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={evaluating || !inputText.trim()}
            className="p-2 rounded-lg bg-rzp-blue hover:bg-sky-600 text-white font-bold transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Sample Voice Prompts */}
      <div className="flex flex-wrap gap-2 pt-1">
        <span className="text-[11px] font-medium text-slate-400 self-center">Try Voice Prompts:</span>
        {[
          "Check OTP bank call scam with AnyDesk screen share active",
          "Analyze KBC lottery prize claim ₹85,000 to unknown VPA",
          "Evaluate suspicious bit.ly WhatsApp link click with sideloaded APK",
          "Check COD order ₹45,000 with address change 1 hour ago",
          "Evaluate credit card payment ₹75,000 with 2 past chargebacks"
        ].map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => { setInputText(sample); }}
            className="px-2.5 py-1 rounded-lg bg-rzp-panel border border-rzp-border text-[11px] text-slate-300 hover:text-white hover:border-rzp-blue/50 transition"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* AI Voice & Text Evaluation Output */}
      {aiResponse && (
        <div className="p-4 rounded-xl bg-rzp-dark border border-rzp-border space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-rzp-border pb-2">
            <span className="font-bold text-white flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-rzp-accent" />
              <span>AI Audio Voice Response:</span>
            </span>
            <button
              onClick={() => speakText(aiResponse.voice_response_transcript)}
              className="text-[11px] text-rzp-accent hover:underline flex items-center space-x-1"
            >
              <span>Replay Audio</span>
            </button>
          </div>

          <p className="text-slate-200 italic font-mono text-[11px] bg-rzp-panel p-2.5 rounded-lg border border-rzp-border">
            "{aiResponse.voice_response_transcript}"
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 rounded bg-rzp-panel text-[11px]">
              <span className="text-slate-400 block">Amount</span>
              <strong className="text-white">₹{aiResponse.extracted_parameters.amount}</strong>
            </div>
            <div className="p-2 rounded bg-rzp-panel text-[11px]">
              <span className="text-slate-400 block">Method</span>
              <strong className="text-white">{aiResponse.extracted_parameters.payment_method}</strong>
            </div>
            <div className="p-2 rounded bg-rzp-panel text-[11px]">
              <span className="text-slate-400 block">Category</span>
              <strong className="text-white">{aiResponse.extracted_parameters.category}</strong>
            </div>
            <div className="p-2 rounded bg-rzp-panel text-[11px]">
              <span className="text-slate-400 block">Risk Score</span>
              <strong className={`font-bold ${
                aiResponse.risk_evaluation.action === 'BLOCK_AND_FLAG' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {aiResponse.risk_evaluation.risk_percentage}%
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
