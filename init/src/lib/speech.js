/**
 * Web Speech API wrapper and state management.
 */

export class SpeechManager {
    constructor(onTranscript, onStateChange) {
        this.onTranscript = onTranscript;
        this.onStateChange = onStateChange;
        this.recognition = null;
        this.isListening = false;
        this.transcript = '';
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.pauseTimeoutId = null;
        this.graceTimeoutId = null;

        this.state = 'IDLE'; // IDLE, RECORDING, PAUSED, TRANSCRIBING, REFORMULATING, REVIEWING, SUBMITTING

        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        this.transcript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                if (this.state === 'PAUSED') {
                    this.setState('RECORDING');
                }
                this.startTimers();

                this.onTranscript(this.transcript + interimTranscript, event.results[event.results.length - 1].isFinal);
            };

            this.recognition.onend = () => {
                if (this.isListening) {
                    this.recognition.start(); // Keep listening until manual stop
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                if (event.error === 'no-speech') return;
                this.stop();
            };
        }
    }

    async start() {
        if (this.isListening) return;

        this.isListening = true;
        this.transcript = '';
        this.setState('RECORDING');
        this.startTimers();

        // Start audio recording for Whisper
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (e) => this.audioChunks.push(e.data);
            this.mediaRecorder.start();
        } catch (err) {
            console.warn('Audio recording failed, falling back to Web Speech only:', err);
        }

        if (this.recognition) {
            this.recognition.start();
        }
    }

    stop() {
        if (!this.isListening) return;

        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        this.resetTimers();
        this.setState('TRANSCRIBING');
    }

    resetTimers() {
        clearTimeout(this.pauseTimeoutId);
        clearTimeout(this.graceTimeoutId);
    }

    startTimers() {
        this.resetTimers();
        if (!this.isListening) return;

        this.pauseTimeoutId = setTimeout(() => {
            if (!this.isListening) return;
            this.setState('PAUSED');

            this.graceTimeoutId = setTimeout(() => {
                if (this.state === 'PAUSED') {
                    this.stop();
                }
            }, 1000);
        }, 2500);
    }

    continueListening() {
        if (this.state !== 'PAUSED') return;
        this.setState('RECORDING');
        this.startTimers();
    }

    setState(newState) {
        this.state = newState;
        this.onStateChange(newState);
    }

    getAudioBlob() {
        if (this.audioChunks.length === 0) return null;
        return new Blob(this.audioChunks, { type: 'audio/webm' });
    }
}
