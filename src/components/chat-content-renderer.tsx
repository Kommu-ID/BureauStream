import { Markdown } from "./markdown"

type ChatContentRendererProps = {
  content: unknown
}

export const ChatContentRenderer = ({ content }: ChatContentRendererProps) => {
  if (typeof content === 'string') {
    return (
      <Markdown>
        {content}
      </Markdown>
    )
  }
  if (Array.isArray(content) && content[0]?.image_url?.url) {
    return (
      <img src={content[0].image_url.url} />
    )
  }
}
