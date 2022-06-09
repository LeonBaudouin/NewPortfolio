export type ImageData = { src: string; alt: string; width: number; height: number; color: string; fullScreen?: string }

export type ProjectApiData = {
  name: string
  year: number
  sections: { title: string; text: string }[]
  image: ImageData
  carousel: ImageData[]
  link: string
  preview: string
  subtitle: string
  slug: string
}

export type AboutData = {
  title: string
  texts: string[]
  socials: Record<string, string>
}
