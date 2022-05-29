export function throttle<E extends Event>(
  callback: <Ev extends E>(e: Ev) => any,
  delay: number
) {
  var previousCall = new Date().getTime()
  return (event: E) => {
    var time = new Date().getTime()

    if (time - previousCall >= delay) {
      previousCall = time
      callback(event)
    }
  }
}
