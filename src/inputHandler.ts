export class InputHandler {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', event => {
      this.keys.add(event.key.toLowerCase());
    });
    window.addEventListener('keyup', event => {
      this.keys.delete(event.key.toLowerCase());
    });
  }

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  clear(): void {
    this.keys.clear();
  }
}
