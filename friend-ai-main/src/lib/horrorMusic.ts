// Real-time Synthesized Horror/Suspense Soundtrack Generator via Web Audio API.
// Mimics tension-building cinematic scores (dissonance, detuned low drone, thumping double-heartbeat, screeches).

class HorrorMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private isPlaying: boolean = false;
  private timerId: any = null;
  private tickCount: number = 0;
  private volumeValue: number = 0.5;

  // Active oscillators/nodes that run continuously
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private mainFilter: BiquadFilterNode | null = null;

  public trackInfo = {
    title: "Slasher's Shadow (Acoustic Tension Model 09)",
    artist: "Project Friend Psychoacoustics",
    description: "Real-time synthesized tension generator mimicking cinematic horror. Features 58Hz micro-detuned sub-drones, localized 130BPM panic heartbeats, and erratic high-register metallic screech waves."
  };

  constructor() {}

  private initAudio() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output volume
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create a high-pass / low-pass combo or warm delay specifically for spatial horror echo
      this.delayNode = this.ctx.createDelay(3.0);
      this.delayNode.delayTime.setValueAtTime(0.48, this.ctx.currentTime); // rhythmic delay offset

      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.setValueAtTime(0.45, this.ctx.currentTime); // high feedback for spooky infinite echoes

      this.delayFilter = this.ctx.createBiquadFilter();
      this.delayFilter.type = "bandpass";
      this.delayFilter.frequency.setValueAtTime(800, this.ctx.currentTime); // hollow mid-range echo

      this.delayNode.connect(this.delayFilter);
      this.delayFilter.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayFeedback.connect(this.masterGain);
    } catch (e) {
      console.warn("Could not load Web Audio context for Horror Core:", e);
    }
  }

  // Starts the endless tense low-frequency drone (constant psychological pressure)
  private startDrone() {
    if (!this.ctx || !this.masterGain) return;
    this.stopDrone();

    const now = this.ctx.currentTime;

    // Filter to sweep the base frequencies like a ghost hovering
    this.mainFilter = this.ctx.createBiquadFilter();
    this.mainFilter.type = "lowpass";
    this.mainFilter.frequency.setValueAtTime(140, now);
    this.mainFilter.connect(this.masterGain);

    // Dynamic filter sweep (endless slow swell)
    const sweepVolumeFilter = () => {
      if (!this.mainFilter || !this.ctx) return;
      const t = this.ctx.currentTime;
      // lowpass sweeps between 80Hz and 220Hz every 8 seconds
      this.mainFilter.frequency.cancelScheduledValues(t);
      this.mainFilter.frequency.setValueAtTime(this.mainFilter.frequency.value, t);
      this.mainFilter.frequency.exponentialRampToValueAtTime(85, t + 4.0);
      this.mainFilter.frequency.exponentialRampToValueAtTime(190, t + 8.0);
    };

    // Detuned lower notes (C2 and Db2) to create maximum acoustic beating/friction (extremely unnerving)
    const baseFreqs = [65.41, 69.30, 98.00, 103.83]; // C2, Db2, G2, Ab2 (Dissonant minor second and tritone relations)

    baseFreqs.forEach((freq, index) => {
      if (!this.ctx || !this.mainFilter) return;

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Alternating waveforms for gritty, hollow textures
      osc.type = index % 2 === 0 ? "sawtooth" : "triangle";
      
      // Micro detuning (8-12 cents off-pitch)
      const detuneValue = index % 2 === 0 ? 10 : -10;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneValue, now);

      // Soft volume per oscillator to prevent clipping
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.12, now + 1.5); // Slower, spooky fade-in

      osc.connect(oscGain);
      oscGain.connect(this.mainFilter);

      osc.start(now);
      this.droneOscs.push(osc);
      this.droneGains.push(oscGain);
    });

    // Run sweep
    sweepVolumeFilter();
    const intervalId = setInterval(sweepVolumeFilter, 8000);
    (this as any)._sweepInterval = intervalId;
  }

  private stopDrone() {
    this.droneOscs.forEach(o => {
      try { o.stop(); } catch(e){}
    });
    this.droneOscs = [];
    this.droneGains = [];
    this.mainFilter = null;
    if ((this as any)._sweepInterval) {
      clearInterval((this as any)._sweepInterval);
      (this as any)._sweepInterval = null;
    }
  }

  // Synthesize a distressing double-thud heartbeat (panic pulse)
  private triggerHeartbeat(time: number, isStrong: boolean = true) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const env = this.ctx.createGain();

    osc.type = "sine";
    // Rapid pitch drop representing heavy, deep thumping
    osc.frequency.setValueAtTime(90, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.14);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, time);

    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(isStrong ? 0.6 : 0.3, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.22);

    osc.connect(filter);
    filter.connect(env);
    env.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.25);
  }

  // Synthesize custom bloodcurdling high screeching sound (reminiscent of the famous Psycho shower scene)
  private triggerHorrorScreech(time: number, frequency: number) {
    if (!this.ctx || !this.masterGain) return;

    // Create dual high saw + square waves with heavy modulation
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const fmMod = this.ctx.createOscillator(); // Frequency modulated siren
    const fmGain = this.ctx.createGain();
    const env = this.ctx.createGain();
    const highFilter = this.ctx.createBiquadFilter();

    osc1.type = "sawtooth";
    osc2.type = "square";

    // Unsettling high pitch
    osc1.frequency.setValueAtTime(frequency, time);
    osc2.frequency.setValueAtTime(frequency * 1.5, time); // Perfect fifth or Tritone multiplier

    // Frequency modulation for terror-vibrato
    fmMod.frequency.setValueAtTime(14, time); // 14Hz fast shrieking vibrato
    fmGain.gain.setValueAtTime(25, time); // pitch bend amplitude

    fmMod.connect(fmGain);
    fmGain.connect(osc1.frequency);
    fmGain.connect(osc2.frequency);

    highFilter.type = "bandpass";
    highFilter.frequency.setValueAtTime(frequency * 1.2, time);
    highFilter.Q.setValueAtTime(4, time);

    // Envelope resembling sudden slashes (violently sharp attack, rapid decay, feedback echoes)
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.12, time + 0.004); // Instant knife-like pick
    env.gain.exponentialRampToValueAtTime(0.04, time + 0.15); // bleed out
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.7);

    osc1.connect(highFilter);
    osc2.connect(highFilter);
    highFilter.connect(env);
    
    // Connect to master volume & spacious delay feedback loop
    env.connect(this.masterGain);
    if (this.delayNode) {
      env.connect(this.delayNode);
    }

    fmMod.start(time);
    osc1.start(time);
    osc2.start(time);

    fmMod.stop(time + 0.82);
    osc1.stop(time + 0.82);
    osc2.stop(time + 0.82);
  }

  // Metallic deep whispering or rusty wind chimes
  private triggerWhisperGasp(time: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    const noiseFilter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    // unstable pitch glides downward
    osc.frequency.setValueAtTime(350, time);
    osc.frequency.exponentialRampToValueAtTime(45, time + 1.2);

    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1200, time);
    // sweep bandpass
    noiseFilter.frequency.exponentialRampToValueAtTime(400, time + 1.0);

    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.08, time + 0.2); // swell
    env.gain.exponentialRampToValueAtTime(0.0001, time + 1.4);

    osc.connect(noiseFilter);
    noiseFilter.connect(env);
    env.connect(this.masterGain);
    if (this.delayNode) env.connect(this.delayNode);

    osc.start(time);
    osc.stop(time + 1.5);
  }

  // Periodic sequencer clock
  private scheduleTensionStep() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Heartbeat clock: 140 BPM is approx a step every 0.21s or so.
    // Let's do a double thud: thud-1, then thud-2 0.16s later.
    const barStep = this.tickCount % 16;

    // Play heartbeat double-bump on step 0, 4, 8, 12
    if (barStep === 0 || barStep === 4 || barStep === 8 || barStep === 12) {
      this.triggerHeartbeat(now, true);
      this.triggerHeartbeat(now + 0.16, false);
    }

    // Erratic jumpy sound triggers mimicking unpredictable horror moments:
    if (barStep === 2) {
      // High tense bell/creak accent
      if (Math.random() > 0.4) {
        this.triggerHorrorScreech(now, 1046.50 + Math.random() * 200); // High C6 screeches
      }
    }

    if (barStep === 6) {
      // Wind whisper gasp
      if (Math.random() > 0.5) {
        this.triggerWhisperGasp(now);
      }
    }

    if (barStep === 10) {
      // Clustered high pitch alarm (Slasher attack!)
      if (Math.random() > 0.3) {
        const frequencies = [1174.66, 1244.51, 1318.51]; // D6, Eb6, E6 clustered dissonant chord!
        frequencies.forEach((f, idx) => {
          this.triggerHorrorScreech(now + idx * 0.05, f);
        });
      }
    }

    this.tickCount++;
  }

  public play() {
    this.initAudio();
    if (this.isPlaying) return;

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;
    this.tickCount = 0;

    // Run low drone instantly
    this.startDrone();

    // 140BPM (0.214s per tick, 4 ticks = 1 beat, let's step every 0.3s for scary sync)
    this.timerId = setInterval(() => {
      this.scheduleTensionStep();
    }, 320);

    console.log("👻 Real-time Psychoacoustics Tension Scopes initiated.");
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.stopDrone();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(vol: number) {
    this.volumeValue = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volumeValue, this.ctx.currentTime, 0.15);
    }
  }

  public getVolume(): number {
    return this.volumeValue;
  }
}

export const horrorMusic = new HorrorMusicEngine();
