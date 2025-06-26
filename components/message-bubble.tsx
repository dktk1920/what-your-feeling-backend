import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { Smile, Frown, Meh } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  emotion?: string
}

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.sender === "user"

  const getEmotionIcon = (emotion?: string) => {
    switch (emotion) {
      case "positive":
      case "기쁨":
        return <Smile className="w-4 h-4 text-yellow-500" />
      case "negative":
      case "슬픔":
      case "화남":
      case "분노":
        return <Frown className="w-4 h-4 text-blue-500" />
      case "mixed":
      case "neutral":
      default:
        return <Meh className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} items-end space-x-2`}>
      {!isUser && (
        <img
          src="/placeholder.svg?height=32&width=32"
          alt="서포터"
          className="w-8 h-8 rounded-full border border-amber-200 shadow-sm mb-6"
        />
      )}
      <div className={`flex items-end space-x-1 ${isUser ? "order-2" : "order-1"}`}>
        <div className="max-w-xs lg:max-w-md">
          <div
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isUser
                ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white"
                : "bg-white border border-gray-100 text-gray-800"
            } ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
          >
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className={`mt-1 px-2 ${isUser ? "text-right" : "text-left"}`}>
            <span className="text-xs text-gray-400">{format(message.timestamp, "HH:mm", { locale: ko })}</span>
          </div>
        </div>
        {!isUser && message.emotion && (
          <div className="mb-6">{getEmotionIcon(message.emotion)}</div>
        )}
      </div>
    </div>
  )
}
