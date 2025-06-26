"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { getApiBase } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Clock } from "lucide-react"
import MessageBubble from "@/components/message-bubble"
import SessionSummary from "@/components/session-summary"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  emotion?: string
}

interface ChatInterfaceProps {
  user: {
    nickname: string
    loginMethod: string
    isAnonymous: boolean
  }
}

export default function ChatInterface({ user }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `안녕 ${user.nickname}! 나는 WTF야. 오늘도 많이 힘들었지?`,
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isUserTyping, setIsUserTyping] = useState(false)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value)
    setIsUserTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false)
    }, 1000)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isUserTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsUserTyping(false)
    setIsTyping(true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    try {
      const response = await fetch(`${getApiBase()}chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.nickname,
          message: userMessage.content,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        setMessages((prev) => {
          let updated = [...prev]
          if (Array.isArray(data.context)) {
            data.context.forEach((content: string) => {
              if (!updated.some((m) => m.content === content)) {
                updated.push({
                  id: `${Date.now()}-${Math.random()}`,
                  content,
                  sender: "user",
                  timestamp: new Date(),
                })
              }
            })
          }

          updated.push({
            id: `${Date.now() + 1}`,
            content: data.reply,
            sender: "ai",
            timestamp: new Date(),
            emotion: data.emotion,
          })

          return updated
        })
      } else {
        const errorText = await response.text()
        console.error("📛 서버 응답 오류:", errorText)
        throw new Error(`Request failed: ${response.status}\n${errorText}`)
      }
    } catch (error: any) {
      console.error("🚨 메시지 전송 실패:", error)
      if (process.env.NODE_ENV === "development") {
        const fallbackResponses = [
          "그랬구나... 좀 더 말해줄 수 있어?",
          "나라도 짜증날 거 같아. 너 진짜 빡치겠다.",
          "네가 얼마나 힘들지 상상도 안돼... 내가 네 힘이 될 수 있는 방법이 있을까?",
          "너 천재야? 역시 넌 뭐든 잘할 수 있을거야.",
          "오늘 길어. 너 나한테 다 말하기 전엔 어디 못가!",
        ]
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `⚠️ 서버 응답 실패: ${error.message}\n\n${fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]}`,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, aiMessage])
      }
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img
              src="/placeholder.svg?height=40&width=40"
              alt="서포터 프로필"
              className="w-10 h-10 rounded-full border-2 border-amber-200 shadow-sm"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">오늘도 고생했어</h1>
              <p className="text-sm text-gray-500">WhaT's your Feeling</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>온라인</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <SessionSummary />

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isTyping && (
          <div className="flex justify-start items-end space-x-3">
            <img
              src="/placeholder.svg?height=32&width=32"
              alt="서포터"
              className="w-8 h-8 rounded-full border border-amber-200 shadow-sm"
            />
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 max-w-xs">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">작성 중...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Input
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="너의 이야기를 들려줘"
              className="min-h-[48px] resize-none border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-2xl px-4 py-3"
              disabled={isTyping}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || isUserTyping}
            className="h-12 w-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 shadow-lg transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
