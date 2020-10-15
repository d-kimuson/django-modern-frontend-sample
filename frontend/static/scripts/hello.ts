export const hello = (name: string, isAlert: boolean): void => {
  const msg = `hello ${name} !`
  if (isAlert) alert(msg)
  else console.log(msg)
}
