// Original calmling procedural ambient soundtrack "Cold Solace"
// Inspired by soft melancholic acoustic indie folk, similar to Prateek Kuhad's "cold/mess" album.
// Synthesized entirely in real-time in the browser via Web Audio API.

class CalmingMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private lastScheduledTime: number = 0;
  private currentStep: number = 0;
  private bpm: number = 76;
  private stepDuration: number = 0; // 1/8 note duration
  private onStateChange: ((isPlaying: boolean) => void) | null = null;
  private volumeValue: number = 0.5;

  // Track info
  public trackInfo = {
    title: "Cold Solace (Original Dream version)",
    album: "Solace on the Nodes",
    artist: "Project Friend Ambient Engine",
    description: "An original real-time synthesized acoustic indie folk sequence with warm, melancholic analog-style guitar plucking and deep safety pads."
  };

  constructor() {
    this.stepDuration = 60 / this.bpm / 2; // eighth notes
  }

  public setCallback(cb: (isPlaying: boolean) => void) {
    this.onStateChange = cb;
  }

  private initAudio() {
    if (this.ctx) return;
    
    // Create audio context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master volume gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Warm Delay Effect for guitar plucks to create that intimate ambient atmosphere
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayNode.delayTime.setValueAtTime(this.stepDuration * 3, this.ctx.currentTime); // Dotted eighth note delay
    
    this.delayFeedback = this.ctx.createGain();
    this.delayFeedback.gain.setValueAtTime(0.38, this.ctx.currentTime); // Safe delay feedback

    this.delayFilter = this.ctx.createBiquadFilter();
    this.delayFilter.type = "lowpass";
    this.delayFilter.frequency.setValueAtTime(900, this.ctx.currentTime); // Keep delayed plucks soft and dark

    // Delay loop connection:
    // Plucks -> delayNode -> delayFilter -> delayFeedback -> delayNode
    //                        delayFeedback -> masterGain
    this.delayNode.connect(this.delayFilter);
    this.delayFilter.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayFeedback.connect(this.masterGain);
  }

  public togglePlay(): boolean {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getVolume(): number {
    return this.volumeValue;
  }

  public play() {
    // Disabled under user request: "remove solace on notes music. no music on home page"
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange(false);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.onStateChange) this.onStateChange(false);
  }

  public setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volumeValue, this.ctx.currentTime, 0.1);
    }
  }

  // Frequency helpers
  private noteToFreq(note: string): number {
    const notes: Record<string, number> = {
      "C2": 65.41, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00, "A3": 220.00, "B3": 246.94,
      "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00, "A4": 440.00, "B4": 493.88,
      "C5": 523.25, "D5": 587.33, "E5": 659.25, "G5": 783.99, "A5": 880.00
    };
    return notes[note] || 440;
  }

  // Synthesize a physical guitar pluck sound
  private triggerPluck(note: string, time: number, velocity: number = 0.7) {
    if (!this.ctx || !this.masterGain) return;

    const freq = this.noteToFreq(note);
    
    // Tone generator (Simulating soft nylon-string acoustic guitar pluck)
    // Primary warm triangle oscillator + secondary subtle sine overtone for organic warmth
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const pluckGain = this.ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(freq, time);
    
    // Add micro-detuning for a rich acoustic-esque vibe
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 2, time); // Octave outline

    // Sound envelope: very sharp attack to simulate fingers picking string, followed by exponential decay
    pluckGain.gain.setValueAtTime(0, time);
    pluckGain.gain.linearRampToValueAtTime(0.24 * velocity, time + 0.006); // Fast attack
    pluckGain.gain.exponentialRampToValueAtTime(0.001, time + 1.2); // Smooth long decay

    // Connect nodes
    osc1.connect(pluckGain);
    osc2.connect(pluckGain);
    
    // Router to master & ambient delay line
    pluckGain.connect(this.masterGain);
    if (this.delayNode) {
      pluckGain.connect(this.delayNode);
    }

    // Start & stop schedule
    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 1.3);
    osc2.stop(time + 1.3);
  }

  // Synthesize a calming heartbeat kick drum pulse (ambient heartbeat)
  private triggerHeartbeat(time: number, velocity: number = 0.45) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();

    osc.type = "sine";
    // Pitch sweep: fast decay from 85Hz down to 25Hz to simulate organic heartbeat
    osc.frequency.setValueAtTime(85, time);
    osc.frequency.exponentialRampToValueAtTime(25, time + 0.12);

    // Dynamic envelope
    kickGain.gain.setValueAtTime(0, time);
    kickGain.gain.linearRampToValueAtTime(0.35 * velocity, time + 0.01);
    kickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.28);

    osc.connect(kickGain);
    kickGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Synthesize a slow warm background synth pad for choral depth
  private triggerPadCard(rootNote: string, fifthNote: string, seventhNote: string, time: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const f1 = this.noteToFreq(rootNote);
    const f2 = this.noteToFreq(fifthNote);
    const f3 = this.noteToFreq(seventhNote);

    const freqs = [f1, f2, f3];
    
    // Create warm synth for each frequency inside the chord card
    freqs.forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const padGain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, time);

      // Warm analog LP Filter targeting 300Hz-420Hz to remove digital edge
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, time);
      filter.frequency.exponentialRampToValueAtTime(450, time + duration / 2);
      filter.frequency.exponentialRampToValueAtTime(300, time + duration);

      // Very soft, relaxing attack to fade notes warm-ly, with smooth release
      padGain.gain.setValueAtTime(0, time);
      padGain.gain.linearRampToValueAtTime(0.045, time + 1.2); // Slow attack
      padGain.gain.setValueAtTime(0.045, time + duration - 1.5);
      padGain.gain.exponentialRampToValueAtTime(0.0001, time + duration); // Soft release

      osc.connect(filter);
      filter.connect(padGain);
      padGain.connect(this.masterGain);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  // Loop Step Scheduler: Coordinates the acoustic arpeggio, soft heartbeat, and cozy background pad
  private scheduleStep(step: number, time: number) {
    const bar = Math.floor(step / 8); // 0, 1, 2, 3
    const stepInBar = step % 8;       // 0 to 7

    // Play heartbeat kick on beat 1 (step 0) and beat 3 (step 4) of every bar
    if (stepInBar === 0 || stepInBar === 4) {
      this.triggerHeartbeat(time, stepInBar === 0 ? 0.45 : 0.25);
    }

    // Trigger full warm pad chords on step 0 of each bar (duration = 1 bar = 8 steps)
    if (stepInBar === 0) {
      const barDuration = this.stepDuration * 8;
      if (bar === 0) {
        // Cmaj7 (C3, G3, B3)
        this.triggerPadCard("C3", "G3", "B3", time, barDuration + 0.05);
      } else if (bar === 1) {
        // Fmaj7 (F3, C3, E3)
        this.triggerPadCard("F3", "C3", "E3", time, barDuration + 0.05);
      } else if (bar === 2) {
        // Am (A3, E3, C4)
        this.triggerPadCard("A3", "E3", "C4", time, barDuration + 0.05);
      } else if (bar === 3) {
        // G (G3, D3, B3)
        this.triggerPadCard("G3", "D3", "B3", time, barDuration + 0.05);
      }
    }

    // Soothing guitar plucking indie-folk pattern
    switch (bar) {
      case 0: // Cmaj7 Bar
        if (stepInBar === 0) this.triggerPluck("C3", time, 0.8); // Bass Root
        if (stepInBar === 1) this.triggerPluck("E4", time, 0.6);
        if (stepInBar === 2) this.triggerPluck("G4", time, 0.5);
        if (stepInBar === 3) this.triggerPluck("B4", time, 0.7);
        if (stepInBar === 4) this.triggerPluck("E4", time, 0.51);
        if (stepInBar === 5) this.triggerPluck("G4", time, 0.6);
        if (stepInBar === 6) this.triggerPluck("C4", time, 0.55);
        if (stepInBar === 7) this.triggerPluck("E4", time, 0.5);
        break;

      case 1: // Fmaj7 Bar
        if (stepInBar === 0) this.triggerPluck("F3", time, 0.85); // Bass Root
        if (stepInBar === 1) this.triggerPluck("A4", time, 0.6);
        if (stepInBar === 2) this.triggerPluck("C4", time, 0.5);
        if (stepInBar === 3) this.triggerPluck("E5", time, 0.75); // High acoustic chime!
        if (stepInBar === 4) this.triggerPluck("A4", time, 0.52);
        if (stepInBar === 5) this.triggerPluck("C4", time, 0.6);
        if (stepInBar === 6) this.triggerPluck("E4", time, 0.58);
        if (stepInBar === 7) this.triggerPluck("A4", time, 0.5);
        break;

      case 2: // Am Bar
        if (stepInBar === 0) this.triggerPluck("A3", time, 0.8); // Bass Root
        if (stepInBar === 1) this.triggerPluck("C4", time, 0.6);
        if (stepInBar === 2) this.triggerPluck("E4", time, 0.5);
        if (stepInBar === 3) this.triggerPluck("A4", time, 0.72);
        if (stepInBar === 4) this.triggerPluck("C4", time, 0.5);
        if (stepInBar === 5) this.triggerPluck("E4", time, 0.6);
        if (stepInBar === 6) this.triggerPluck("G4", time, 0.62); // Melodic variance
        if (stepInBar === 7) this.triggerPluck("C5", time, 0.65);
        break;

      case 3: // G Bar resolving back to Cmaj7
        if (stepInBar === 0) this.triggerPluck("G3", time, 0.8); // Bass Root
        if (stepInBar === 1) this.triggerPluck("B3", time, 0.6);
        if (stepInBar === 2) this.triggerPluck("D4", time, 0.5);
        if (stepInBar === 3) this.triggerPluck("G4", time, 0.7);
        if (stepInBar === 4) this.triggerPluck("B3", time, 0.5);
        if (stepInBar === 5) this.triggerPluck("D4", time, 0.58);
        if (stepInBar === 6) this.triggerPluck("B4", time, 0.65); // Warm resolution
        if (stepInBar === 7) this.triggerPluck("D5", time, 0.55);
        break;
    }
  }
}

// Export singleton instance so it is universally accessible across App.tsx
export const calmingMusic = new CalmingMusicEngine();
