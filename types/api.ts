export type ImageData = { src: string; alt: string; width: number; height: number; color: string; fullScreen?: string }

export type ProjectApiData = {
  name: string
  sections: { title: string; text: string }[]
  image: ImageData
  carousel: ImageData[]
  link: string
}
