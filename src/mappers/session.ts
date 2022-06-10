export class Session {
  static fromSdp(value: RTCSessionDescription) {
    return window.btoa(JSON.stringify(value))
  }

  static toSdp(value: string) {
    const parsed = JSON.parse(window.atob(value))
    return new RTCSessionDescription(parsed)
  }
}
