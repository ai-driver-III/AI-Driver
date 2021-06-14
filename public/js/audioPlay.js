class AudioPlay {
    static get audioPlayFlag() {
        delete AudioPlay.audioPlayFlag;
        return AudioPlay.audioPlayFlag;
    }
    static set audioPlayFlag(value) {
      delete AudioPlay.audioPlayFlag;
      AudioPlay.audioPlayFlag = value;
    }
    get audioPlayFlag() {
        return this.constructor.audioPlayFlag;
    }
    set audioPlayFlag(value) {
        this.constructor.audioPlayFlag = value;
    }
    constructor(soundURL) {
        this.constructor.audioPlayFlag = true;
        // Check if the browser supports web audio. Safari wants a prefix.
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
    
          var URL = soundURL;
          this.URL = URL;
          var AudioContext = window.AudioContext || window.webkitAudioContext;
          this.context = new AudioContext(); // Make it crossbrowser
          var gainNode = this.context.createGain();
          gainNode.gain.value = 1; // set volume to 100%
          this.yodelBuffer = void 0;
    
          // The Promise-based syntax for BaseAudioContext.decodeAudioData() is not supported in Safari(Webkit).
          window.fetch(URL)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.context.decodeAudioData(arrayBuffer,
               audioBuffer => {
                    this.yodelBuffer = audioBuffer;
                },
                error =>
                  console.error(error)
              ))
      }}
    play() {
          //////////////////////////////////////////////////
          // Here's the part for just playing an audio file.
          //////////////////////////////////////////////////
        // console.log(this.URL, this.constructor.audioPlayFlag);
        self = this;
        if (this.constructor.audioPlayFlag) {
            this.constructor.audioPlayFlag = false;
            // console.log(this.URL, this.constructor.audioPlayFlag);
            this.source = this.context.createBufferSource();
            this.source.buffer = this.yodelBuffer;
            this.source.connect(this.context.destination);
            this.source.start();
            this.source.onended = function () {
                self.constructor.audioPlayFlag = true; 
                // console.log(self.URL, self.constructor.audioPlayFlag);
            }
        }
    };
}
export default AudioPlay;