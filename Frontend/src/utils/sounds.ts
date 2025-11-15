// Chess sound effects using Web Audio API

class ChessSounds {
  private audioContext: AudioContext | null = null;

  private getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    const ctx = this.getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  playMove() {
    this.playTone(440, 0.1);
  }

  playCapture() {
    const ctx = this.getAudioContext();
    this.playTone(330, 0.15);
    setTimeout(() => this.playTone(220, 0.1), 80);
  }

  playCheck() {
    const ctx = this.getAudioContext();
    this.playTone(660, 0.12);
    setTimeout(() => this.playTone(880, 0.12), 100);
  }

  playGameEnd(isWin: boolean) {
    if (isWin) {
      // Victory fanfare
      this.playTone(523, 0.2); // C
      setTimeout(() => this.playTone(659, 0.2), 150); // E
      setTimeout(() => this.playTone(784, 0.3), 300); // G
    } else {
      // Draw sound
      this.playTone(392, 0.2);
      setTimeout(() => this.playTone(349, 0.3), 150);
    }
  }
}

export const chessSounds = new ChessSounds();
