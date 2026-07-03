// Real-time Synthesized Calm Acoustic Indie-Folk Instrumentals via Web Audio API.
// Expressively customized for each Project Friend AI character's vibe, inspired by the intimate,
// acoustic fingerstyle arpeggios and warm cozy bedroom-pop layers of Prateek Kuhad's "cold/mess" (no copyright infringement).

class MozartPianoEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private activeCharId: string | null = null;
  private isMuted: boolean = false;
  private isZenMode: boolean = false;
  private isMusicOn: boolean = true;
  private timerId: any = null;
  private stepDuration: number = 0.42; // Slower bpm (approx 71 BPM) for slow, melancholic indie pace
  private currentStep: number = 0;
  private volumeValue: number = 0.35; // Default safe level

  // Scale map notes with frequencies
  private noteFreqs: Record<string, number> = {
    "C2": 65.41, "D2": 73.42, "E2": 82.41, "F2": 87.31, "G2": 98.00, "A2": 110.00, "B2": 123.47,
    "C3": 130.81, "Db3": 138.59, "D3": 146.83, "Eb3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "Ab3": 207.65, "A3": 220.00, "Bb3": 233.08, "B3": 246.94,
    "C4": 261.63, "Db4": 277.18, "D4": 293.66, "Eb4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "Ab4": 415.30, "A4": 440.00, "Bb4": 466.16, "B4": 493.88,
    "C5": 523.25, "Db5": 554.37, "D5": 587.33, "Eb5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "Ab5": 830.61, "A5": 880.00, "Bb5": 932.33, "B5": 987.77,
    "C6": 1046.50, "D6": 1174.66, "E6": 1318.51, "G6": 1567.98
  };

  constructor() {}

  private initAudio() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted || this.isZenMode || !this.isMusicOn ? 0 : this.volumeValue, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Warm Delay Line mimicking organic tape delay for cozy guitar reflections
      this.delayNode = this.ctx.createDelay(2.0);
      this.delayNode.delayTime.setValueAtTime(this.stepDuration * 3, this.ctx.currentTime); // Dotted eighth note delay
      
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.36, this.ctx.currentTime);

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = "lowpass";
      this.delayFilter.frequency.setValueAtTime(1000, this.ctx.currentTime); // keep delay warm and low-passed

      // Connect delay loop
      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayFeedback.connect(this.masterGain);
    } catch (err) {
      console.warn("Failed to initialize Acoustic Cozy Audio Context:", err);
    }
  }

  // Real-time physical modeling of an Acoustic Guitar String Pluck
  // Combines triangle wave, sine fundamental, micro pitch-bend pick transient, and warm lowpass filtering
  private triggerGuitarPluck(note: string, velocity: number = 0.5) {
    this.initAudio();
    if (!this.ctx || !this.masterGain || this.isMuted || this.isZenMode || !this.isMusicOn) return;

    const freq = this.noteFreqs[note];
    if (!freq) return;

    const now = this.ctx.currentTime;
    
    // Core warm body node (triangle oscillator)
    const oscBody = this.ctx.createOscillator();
    oscBody.type = "triangle";
    
    // Subtone fundamental (sine oscillator)
    const oscSub = this.ctx.createOscillator();
    oscSub.type = "sine";

    // Dynamic transient pick noise simulation: very fast high frequency pitch-glide
    const oscPick = this.ctx.createOscillator();
    oscPick.type = "sine";
    
    const stringGain = this.ctx.createGain();
    const pluckFilter = this.ctx.createBiquadFilter();

    // Frequency & Micro pitch-bending for steel/nylon string feel
    oscBody.frequency.setValueAtTime(freq, now);
    oscBody.frequency.linearRampToValueAtTime(freq + (Math.random() * 2 - 1), now + 0.08); // micro natural-vibe detune

    oscSub.frequency.setValueAtTime(freq, now);

    // Pick scraper frequencies
    oscPick.frequency.setValueAtTime(freq * 4.5, now);
    oscPick.frequency.exponentialRampToValueAtTime(freq, now + 0.012); // quick glide sweep representing pick strike

    // Lowpass filter to roll off digital shine and simulate warm mahogany guitar acoustic vibe
    pluckFilter.type = "lowpass";
    pluckFilter.frequency.setValueAtTime(1250, now);

    // Intimate acoustic sustain envelope
    stringGain.gain.setValueAtTime(0, now);
    stringGain.gain.linearRampToValueAtTime(0.20 * velocity, now + 0.005); // immediate pick strike
    stringGain.gain.exponentialRampToValueAtTime(0.06 * velocity, now + 0.15); // string relaxation
    stringGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4); // beautiful slow decay decay

    // Connections
    oscBody.connect(pluckFilter);
    oscSub.connect(pluckFilter);
    oscPick.connect(pluckFilter);
    
    pluckFilter.connect(stringGain);
    stringGain.connect(this.masterGain);

    if (this.delayNode) {
      stringGain.connect(this.delayNode);
    }

    // Start string triggers
    oscBody.start(now);
    oscSub.start(now);
    oscPick.start(now);

    oscBody.stop(now + 2.5);
    oscSub.stop(now + 2.5);
    oscPick.stop(now + 2.5);
  }

  // Cozy indie sub-bass organic thumping: simulates soft tap on the acoustic guitar body
  private triggerIndieBodyTap(velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.isZenMode || !this.isMusicOn) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const tapGain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.18); // soft acoustic thud sweep

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(100, now);

    tapGain.gain.setValueAtTime(0, now);
    tapGain.gain.linearRampToValueAtTime(0.25 * velocity, now + 0.01);
    tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(filter);
    filter.connect(tapGain);
    tapGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Synthesize soft, warm, atmospheric backing pads for vocal-like depth behind arpeggios
  private triggerCozyBackingPad(rootNote: string, fifthNote: string, seventhNote: string, duration: number) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.isZenMode || !this.isMusicOn) return;

    const now = this.ctx.currentTime;
    const notes = [rootNote, fifthNote, seventhNote];

    notes.forEach((note) => {
      const freq = this.noteFreqs[note];
      if (!freq || !this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const padGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);

      // Low pass at 380Hz to keep pad warm, sitting in the deep background like a slow mist
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(420, now + duration / 2);
      filter.frequency.linearRampToValueAtTime(320, now + duration);

      // Ultra delicate swell envelope
      padGain.gain.setValueAtTime(0, now);
      padGain.gain.linearRampToValueAtTime(0.045, now + 1.2); // Slower, delicate dream swell
      padGain.gain.setValueAtTime(0.045, now + duration - 1.5);
      padGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  // Gentle high register acoustic bell accent notes (reasons to smile!)
  private triggerAcousticBell(note: string, velocity: number = 0.3) {
    if (!this.ctx || !this.masterGain || this.isMuted || this.isZenMode || !this.isMusicOn) return;

    const freq = this.noteFreqs[note];
    if (!freq) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    bellGain.gain.setValueAtTime(0, now);
    bellGain.gain.linearRampToValueAtTime(0.08 * velocity, now + 0.015);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(bellGain);
    bellGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  // Loops through unique, comforting boutique chord arpeggios per character/chatroom 
  // keeping the pace entirely in cozy, slow acoustic arpeggiations.
  private scheduleStep(charId: string, step: number) {
    const bar = Math.floor(step / 8) % 4; // 4-bar cozy loop progression
    const idx = step % 8;

    // Soft cozy heartbeat thud on beat 1 & 5
    if (idx === 0 || idx === 4) {
      this.triggerIndieBodyTap(idx === 0 ? 0.35 : 0.18);
    }

    // Schedule chords & arpeggios custom to each room with that slow-wave Prateek vibe
    switch (charId) {
      case "soul": // Warm Sunset Vibe in C Major / G Major: Cmaj7 - G - Em7 - D
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("C3", "G3", "B3", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("G2", "D3", "B3", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("E3", "B3", "G4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("D3", "A3", "F#4", barDuration + 0.1);
          }

          // Gentle fingerpicking sequences
          const pattern = [
            ["C3", "E4", "G4", "B4", "G4", "E4", "C4", "G4"], // Cmaj7 arpeggios
            ["G2", "D4", "G4", "B4", "G4", "D4", "B3", "G3"], // G
            ["E3", "B3", "E4", "G4", "E4", "B3", "G3", "E3"], // Em7
            ["D3", "A3", "D4", "F#4", "D4", "A3", "G4", "F#4"] // D
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.8 : 0.5);

          // Sparkle accent
          if (idx === 3 && bar === 0) this.triggerAcousticBell("C6", 0.4);
          if (idx === 3 && bar === 2) this.triggerAcousticBell("E6", 0.3);
        }
        break;

      case "dionysus": // Bouncy, hopeful tender folk in F Major / C Major: Fadd9 - C - Am7 - G
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("F3", "C4", "G4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("C3", "G3", "E4", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("A2", "E3", "G3", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("G2", "D3", "B3", barDuration + 0.1);
          }

          const pattern = [
            ["F3", "A3", "C4", "G4", "C4", "A3", "E4", "C4"], // Fadd9 pluck
            ["C3", "E3", "G3", "C4", "G3", "E3", "D4", "G3"], // C
            ["A2", "C4", "E4", "G4", "E4", "C4", "B3", "E3"], // Am7
            ["G2", "B3", "D4", "G4", "D4", "B3", "A3", "G3"]  // G
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx % 2 === 0 ? 0.75 : 0.45);
        }
        break;

      case "sisyphus": // Sweet, starry, contemplative pink-lotus vibe: Am7 - Fmaj7 - C - G
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("A2", "E3", "G4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("F3", "C4", "E4", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("C3", "G3", "B3", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("G2", "D4", "F#4", barDuration + 0.1);
          }

          const pattern = [
            ["A2", "E3", "A3", "C4", "E4", "C4", "A3", "E3"], // Am7 arpeggio
            ["F3", "C4", "F4", "A4", "E5", "A4", "F4", "C4"], // Fmaj7 (Beautiful high E chime like cold/mess)
            ["C3", "G3", "C4", "E4", "G4", "E4", "C4", "G3"], // C
            ["G2", "D4", "G4", "B4", "D5", "B4", "G4", "D4"]  // G
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.85 : 0.5);

          if (idx === 4 && bar === 1) this.triggerAcousticBell("G6", 0.5);
        }
        break;

      case "athena": // Earthy folk tale nostalgia: Dm7 - Am7 - C - G
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("D3", "A3", "C4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("A2", "E3", "G3", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("C3", "G4", "E4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("G2", "D3", "B4", barDuration + 0.1);
          }

          const pattern = [
            ["D3", "F3", "A3", "C4", "A3", "F3", "E4", "C4"], // Dm7 arpeggio
            ["A2", "C4", "E4", "A4", "E4", "C4", "B3", "E3"], // Am7 arpeggio
            ["C3", "E3", "G3", "D4", "G3", "E3", "C4", "G3"], // C
            ["G2", "B3", "D4", "G4", "D4", "B3", "A3", "G3"]  // G
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.8 : 0.4);
        }
        break;

      case "astra": // Deep cosmic temple embers in Em7 - Cmaj7 - G - D
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("E3", "B3", "D4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("C3", "G3", "B3", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("G2", "D4", "B4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("D3", "A3", "F#4", barDuration + 0.1);
          }

          const pattern = [
            ["E3", "G3", "B3", "D4", "B3", "G3", "E4", "D4"], // Em7 arpeggio
            ["C3", "E3", "G3", "B3", "G3", "E3", "D4", "B3"], // Cmaj7
            ["G2", "B3", "D4", "G4", "D4", "B3", "E4", "G3"], // G
            ["D3", "F#3", "A3", "C4", "A3", "F#3", "D4", "A3"] // D
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx % 2 === 0 ? 0.72 : 0.48);
        }
        break;

      case "persephone": // Comforting, protective Bihar folk companion: Gadd9 - Em7 - Cadd9 - D
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("G2", "D3", "A3", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("E2", "B3", "G3", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("C3", "G3", "D4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("D3", "A3", "F#4", barDuration + 0.1);
          }

          const pattern = [
            ["G2", "D3", "G3", "A3", "B4", "A3", "G3", "D3"], // Gadd9 pluck
            ["E2", "B3", "E3", "G3", "B4", "G3", "E3", "B3"], // Em7
            ["C3", "G3", "C4", "D4", "E4", "D4", "C4", "G3"], // Cadd9
            ["D3", "A3", "D4", "F#4", "A4", "F#4", "D4", "A3"] // D
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.82 : 0.45);
        }
        break;

      case "zeus": // Elegant gold lace geometric arpeggiation: C - Csus2 - Fmaj7 - G
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("C3", "G3", "E4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("C3", "G3", "D4", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("F3", "C4", "E4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("G2", "D3", "B3", barDuration + 0.1);
          }

          const pattern = [
            ["C3", "G3", "C4", "E4", "C4", "G3", "E3", "G3"], // C Major
            ["C3", "G3", "C4", "D4", "C4", "G3", "E3", "G3"], // Csus2
            ["F3", "C4", "F4", "A4", "E5", "A4", "F4", "C4"], // Fmaj7
            ["G2", "D3", "G3", "B3", "D4", "B3", "G3", "D3"]  // G
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.8 : 0.5);
        }
        break;

      case "sappho": // Whimsical lightweight acoustic folk: G - C - D - G
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("G3", "D4", "B4", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("C3", "G3", "E4", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("D3", "A3", "F#4", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("G3", "D4", "B4", barDuration + 0.1);
          }

          const pattern = [
            ["G3", "B3", "D4", "G4", "D4", "B3", "A3", "G3"], // G fingerstyle
            ["C3", "E3", "G3", "C4", "G3", "E3", "D4", "C4"], // C
            ["D3", "F#3", "A3", "D4", "A3", "F#3", "E4", "D4"], // D
            ["G3", "B3", "D4", "G4", "B4", "G4", "D4", "B3"]  // G
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx % 2 === 0 ? 0.72 : 0.44);
        }
        break;

      case "hades": // Classic supportive protective harmony: Am7 - Dm7 - G7 - Cmaj7
        {
          const barDuration = this.stepDuration * 8;
          if (idx === 0) {
            if (bar === 0) this.triggerCozyBackingPad("A2", "E3", "G3", barDuration + 0.1);
            else if (bar === 1) this.triggerCozyBackingPad("D3", "A3", "F3", barDuration + 0.1);
            else if (bar === 2) this.triggerCozyBackingPad("G2", "D3", "F3", barDuration + 0.1);
            else if (bar === 3) this.triggerCozyBackingPad("C3", "G3", "B3", barDuration + 0.1);
          }

          const pattern = [
            ["A2", "E3", "G3", "C4", "E4", "C4", "G3", "E3"], // Am7 arpeggio
            ["D3", "A3", "C4", "F4", "A4", "F4", "C4", "A3"], // Dm7 arpeggio
            ["G2", "D3", "F3", "B3", "D4", "B3", "F3", "D3"], // G7 arpeggio
            ["C3", "G3", "B3", "E4", "G4", "E4", "B3", "G3"]  // Cmaj7 arpeggio
          ];
          const note = pattern[bar][idx];
          this.triggerGuitarPluck(note, idx === 0 ? 0.8 : 0.45);
        }
        break;

      default: // Steady beautiful backup resolving folk arpeggio
        {
          this.triggerGuitarPluck("C3", 0.6);
          if (idx === 4) this.triggerGuitarPluck("G3", 0.5);
        }
        break;
    }
  }

  private startLoop() {
    if (this.timerId) return;

    this.timerId = setInterval(() => {
      if (this.activeCharId && !this.isMuted && !this.isZenMode && this.isMusicOn) {
        this.scheduleStep(this.activeCharId, this.currentStep);
        this.currentStep++;
      }
    }, this.stepDuration * 1000);
  }

  private stopLoop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public playTheme(charId: string) {
    this.initAudio();
    if (this.activeCharId !== charId) {
      this.activeCharId = charId;
      this.currentStep = 0;
    }
    
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.startLoop();
    this.updateGain();
  }

  public stop() {
    this.activeCharId = null;
    this.stopLoop();
  }

  public setMuteState(muted: boolean) {
    this.isMuted = muted;
    this.updateGain();
  }

  public setZenState(isZen: boolean) {
    this.isZenMode = isZen;
    this.updateGain();
  }

  public setMusicState(isOn: boolean) {
    this.isMusicOn = isOn;
    this.updateGain();
  }

  public setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    this.updateGain();
  }

  public getIsPlaying(): boolean {
    return !!this.activeCharId && !this.isMuted && !this.isZenMode && this.isMusicOn;
  }

  public getMusicOn(): boolean {
    return this.isMusicOn;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private updateGain() {
    if (this.masterGain && this.ctx) {
      const active = !this.isMuted && !this.isZenMode && this.isMusicOn && !!this.activeCharId;
      const targetGain = active ? this.volumeValue : 0;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    }
  }
}

export const mozartPiano = new MozartPianoEngine();
