/**
 * Web Speech API wrapper and state management.
 */

export class SpeechManager {
    constructor(onTranscript, onStateChange) {
        console.log('[SpeechManager] Initializing...');
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

        // Check for Speech Recognition support
        const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        console.log('[SpeechManager] SpeechRecognition support:', hasSpeechRecognition);
        console.log('[SpeechManager] window.SpeechRecognition:', window.SpeechRecognition || 'undefined');
        console.log('[SpeechManager] window.webkitSpeechRecognition:', window.webkitSpeechRecognition || 'undefined');

        if (hasSpeechRecognition) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            console.log('[SpeechManager] Recognition created with continuous=true, interimResults=true');

            this.recognition.onstart = () => {
                console.log('[SpeechManager] Recognition STARTED event fired');
            };

            this.recognition.onresult = (event) => {
                console.log('[SpeechManager] Recognition RESULT event fired. Results:', event.results);
                console.log('[SpeechManager] ResultIndex:', event.resultIndex, 'Results length:', event.results.length);
                
                let interimTranscript = '';
                let finalTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    const isFinal = event.results[i].isFinal;
                    console.log(`[SpeechManager] Result ${i}: "${transcript}" (isFinal: ${isFinal}, confidence: ${event.results[i][0].confidence})`);
                    
                    if (isFinal) {
                        this.transcript += transcript;
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (this.state === 'PAUSED') {
                    console.log('[SpeechManager] Auto-resuming from PAUSED state due to new speech');
                    this.setState('RECORDING');
                }
                this.startTimers();

                const fullText = this.transcript + interimTranscript;
                console.log('[SpeechManager] Calling onTranscript with:', fullText, 'isFinal:', event.results[event.results.length - 1].isFinal);
                this.onTranscript(fullText, event.results[event.results.length - 1].isFinal);
            };

            this.recognition.onend = () => {
                console.log('[SpeechManager] Recognition END event fired. isListening:', this.isListening);
                if (this.isListening) {
                    console.log('[SpeechManager] Restarting recognition (continuous listening)');
                    try {
                        this.recognition.start();
                    } catch (err) {
                        console.error('[SpeechManager] Failed to restart recognition:', err);
                    }
                }
            };

            this.recognition.onerror = (event) => {
                console.error('[SpeechManager] Recognition ERROR:', event.error);
                console.error('[SpeechManager] Error details:', JSON.stringify({
                    error: event.error,
                    message: event.message,
                    state: this.state,
                    isListening: this.isListening
                }));
                
                // Don't ignore any errors in debug mode - log them all
                if (event.error === 'no-speech') {
                    console.log('[SpeechManager] No speech detected - this is normal if silence continues');
                    return;
                }
                if (event.error === 'aborted') {
                    console.log('[SpeechManager] Recognition aborted - usually from manual stop');
                    return;
                }
                console.error('[SpeechManager] Stopping due to error:', event.error);
                this.stop();
            };

            this.recognition.onnomatch = () => {
                console.log('[SpeechManager] Recognition NOMATCH event fired - no speech recognized');
            };
        } else {
            console.error('[SpeechManager] SpeechRecognition API NOT AVAILABLE in this browser');
        }
    }

    async start() {
        console.log('[SpeechManager] start() called. isListening:', this.isListening, 'state:', this.state);
        if (this.isListening) {
            console.log('[SpeechManager] Already listening, ignoring start() call');
            return;
        }

        this.isListening = true;
        this.transcript = '';
        this.setState('RECORDING');
        this.startTimers();

        // Start audio recording for Whisper
        console.log('[SpeechManager] Attempting to get audio permissions...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('[SpeechManager] Audio permission GRANTED. Stream tracks:', stream.getAudioTracks().map(t => t.label));
            
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (e) => {
                console.log('[SpeechManager] MediaRecorder data available. Size:', e.data.size, 'bytes');
                this.audioChunks.push(e.data);
            };
            this.mediaRecorder.onstart = () => {
                console.log('[SpeechManager] MediaRecorder STARTED');
            };
            this.mediaRecorder.onstop = () => {
                console.log('[SpeechManager] MediaRecorder STOPPED');
            };
            this.mediaRecorder.onerror = (e) => {
                console.error('[SpeechManager] MediaRecorder ERROR:', e);
            };
            this.mediaRecorder.start();
            console.log('[SpeechManager] MediaRecorder state after start:', this.mediaRecorder.state);
        } catch (err) {
            console.warn('[SpeechManager] Audio recording failed:', err.name, err.message);
            console.warn('[SpeechManager] This is OK - falling back to Web Speech only');
        }

        if (this.recognition) {
            console.log('[SpeechManager] Starting SpeechRecognition...');
            try {
                this.recognition.start();
                console.log('[SpeechManager] recognition.start() called successfully');
            } catch (err) {
                console.error('[SpeechManager] Failed to start recognition:', err.name, err.message);
                console.error('[SpeechManager] Error stack:', err.stack);
            }
        } else {
            console.error('[SpeechManager] Cannot start - recognition object is null');
        }
    }

    stop() {
        console.log('[SpeechManager] stop() called. isListening:', this.isListening, 'state:', this.state);
        if (!this.isListening) {
            console.log('[SpeechManager] Not listening, ignoring stop() call');
            return;
        }

        this.isListening = false;
        if (this.recognition) {
            console.log('[SpeechManager] Stopping SpeechRecognition...');
            try {
                this.recognition.stop();
            } catch (err) {
                console.error('[SpeechManager] Error stopping recognition:', err);
            }
        }

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            console.log('[SpeechManager] Stopping MediaRecorder...');
            try {
                this.mediaRecorder.stop();
                this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
                console.log('[SpeechManager] MediaRecorder stopped and stream tracks released');
            } catch (err) {
                console.error('[SpeechManager] Error stopping media recorder:', err);
            }
        }

        this.resetTimers();
        this.setState('TRANSCRIBING');
        console.log('[SpeechManager] Stopped successfully');
    }

    resetTimers() {
        console.log('[SpeechManager] Resetting timers');
        clearTimeout(this.pauseTimeoutId);
        clearTimeout(this.graceTimeoutId);
        this.pauseTimeoutId = null;
        this.graceTimeoutId = null;
    }

    startTimers() {
        this.resetTimers();
        if (!this.isListening) {
            console.log('[SpeechManager] Not listening, skipping timer start');
            return;
        }

        console.log('[SpeechManager] Starting pause timeout (2500ms)...');
        this.pauseTimeoutId = setTimeout(() => {
            if (!this.isListening) {
                console.log('[SpeechManager] Pause timeout fired but not listening anymore, ignoring');
                return;
            }
            console.log('[SpeechManager] Pause timeout fired - entering PAUSED state');
            this.setState('PAUSED');

            console.log('[SpeechManager] Starting grace period timeout (1000ms)...');
            this.graceTimeoutId = setTimeout(() => {
                if (this.state === 'PAUSED') {
                    console.log('[SpeechManager] Grace period expired - stopping recording');
                    this.stop();
                } else {
                    console.log('[SpeechManager] Grace period expired but state is', this.state, '- not stopping');
                }
            }, 1000);
        }, 2500);
    }

    continueListening() {
        console.log('[SpeechManager] continueListening() called. Current state:', this.state);
        if (this.state !== 'PAUSED') {
            console.log('[SpeechManager] Not in PAUSED state, ignoring continueListening()');
            return;
        }
        this.setState('RECORDING');
        this.startTimers();
        console.log('[SpeechManager] Continued listening, timers restarted');
    }

    setState(newState) {
        console.log(`[SpeechManager] State change: ${this.state} → ${newState}`);
        this.state = newState;
        this.onStateChange(newState);
    }

    getAudioBlob() {
        console.log('[SpeechManager] getAudioBlob() called. Chunks count:', this.audioChunks.length);
        if (this.audioChunks.length === 0) {
            console.log('[SpeechManager] No audio chunks available');
            return null;
        }
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        console.log('[SpeechManager] Audio blob created. Size:', blob.size, 'bytes, type:', blob.type);
        return blob;
    }
}
