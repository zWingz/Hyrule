export function readAsBase64(file): Promise<string> {
  return new Promise((res, rej) => {
    const fileReader = new FileReader()
    fileReader.onload = () => {
      res(fileReader.result as string)
    }
    fileReader.onerror = rej
    fileReader.readAsDataURL(file) // 将文件转成base64
  })
}
