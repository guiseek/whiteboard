export function throttle<E extends Event>(
  callback: <Ev extends E>(e: Ev) => any,
  delay: number
) {
  let previousCall = new Date().getTime()
  return (event: E) => {
    const time = new Date().getTime()

    if (time - previousCall >= delay) {
      previousCall = time
      callback(event)
    }
  }
}
