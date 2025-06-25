"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Sparkles, ImageIcon, BookOpen } from "lucide-react"

interface DiaryEntryType {
  id: string
  date: Date
  title: string
  content: string
  emotion: "happy" | "sad" | "neutral" | "excited" | "anxious"
  imageUrl: string
  summary: string
}

interface DiaryCreationProps {
  onComplete: (entry: DiaryEntryType) => void
  onCancel: () => void
}

export default function DiaryCreation({ onComplete, onCancel }: DiaryCreationProps) {
  const [step, setStep] = useState<"input" | "analyzing" | "generating" | "complete">("input")
  const [userInput, setUserInput] = useState("")
  const [generatedEntry, setGeneratedEntry] = useState<DiaryEntryType | null>(null)

  const handleAnalyze = async () => {
    if (!userInput.trim()) return

    setStep("analyzing")

    // 감정 분석 시뮬레이션
    setTimeout(() => {
      setStep("generating")

      // 이미지 생성 시뮬레이션
      setTimeout(() => {
        const emotions: Array<"happy" | "sad" | "neutral" | "excited" | "anxious"> = [
          "happy",
          "sad",
          "neutral",
          "excited",
          "anxious",
        ]
        const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]

        const titles = {
          happy: ["밝은 하루", "기쁜 순간", "행복한 시간"],
          sad: ["조용한 하루", "생각이 많은 날", "차분한 시간"],
          neutral: ["평범한 일상", "고요한 하루", "잔잔한 시간"],
          excited: ["설레는 하루", "활기찬 순간", "에너지 넘치는 시간"],
          anxious: ["복잡한 마음", "고민이 많은 날", "불안한 시간"],
        }

        const newEntry: DiaryEntryType = {
          id: Date.now().toString(),
          date: new Date(),
          title: titles[randomEmotion][Math.floor(Math.random() * titles[randomEmotion].length)],
          content: generateDiaryContent(userInput, randomEmotion),
          emotion: randomEmotion,
          imageUrl: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(randomEmotion)}`,
          summary: generateSummary(userInput),
        }

        setGeneratedEntry(newEntry)
        setStep("complete")
      }, 3000)
    }, 2000)
  }

  const generateDiaryContent = (input: string, emotion: string): string => {
    const templates = {
      happy: [
        "오늘은 정말 기분 좋은 하루였다. ",
        "마음이 한결 가벼워진 것 같다. ",
        "긍정적인 에너지가 느껴지는 하루였다. ",
      ],
      sad: ["오늘은 조금 우울한 기분이었다. ", "마음이 무거운 하루였다. ", "생각이 많아지는 하루였다. "],
      neutral: ["오늘은 평범한 하루였다. ", "차분하게 하루를 보냈다. ", "고요한 마음으로 하루를 마무리한다. "],
      excited: ["오늘은 설레는 일들이 많았다. ", "에너지가 넘치는 하루였다. ", "활기찬 기분으로 하루를 보냈다. "],
      anxious: ["오늘은 마음이 복잡했다. ", "여러 가지 걱정이 많은 하루였다. ", "불안한 마음을 달래려 노력했다. "],
    }

    const template = templates[emotion as keyof typeof templates]
    const randomTemplate = template[Math.floor(Math.random() * template.length)]

    return randomTemplate + "상담을 통해 내 마음을 더 잘 이해하게 되었다. 앞으로도 이런 시간들이 도움이 될 것 같다."
  }

  const generateSummary = (input: string): string => {
    return "오늘의 상담을 통해 느낀 감정과 생각들을 정리한 일기"
  }

  const handleComplete = () => {
    if (generatedEntry) {
      onComplete(generatedEntry)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">감정 일기 작성</h1>
            <p className="text-gray-600">AI가 당신의 감정을 분석하여 일기를 만들어드립니다</p>
          </div>
        </div>

        {step === "input" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-amber-600" />
                오늘의 감정을 들려주세요
              </CardTitle>
              <CardDescription>
                오늘 상담에서 느꼈던 감정이나 생각을 자유롭게 적어주세요. AI가 이를 바탕으로 감정 일기를 작성해드립니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="예: 오늘 상담에서 직장 스트레스에 대해 이야기했는데, 조금 마음이 가벼워진 것 같아요. 하지만 여전히 불안한 마음이 있어서..."
                className="min-h-[120px] border-gray-200 focus:border-amber-300 focus:ring-amber-200"
              />
              <Button
                onClick={handleAnalyze}
                disabled={!userInput.trim()}
                className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                감정 일기 생성하기
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "analyzing" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">감정을 분석하고 있어요</h3>
              <p className="text-gray-600">당신의 마음을 이해하고 있습니다...</p>
            </CardContent>
          </Card>
        )}

        {step === "generating" && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <ImageIcon className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">일기와 이미지를 생성하고 있어요</h3>
              <p className="text-gray-600">당신만의 특별한 감정 일기를 만들고 있습니다...</p>
            </CardContent>
          </Card>
        )}

        {step === "complete" && generatedEntry && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-amber-800">감정 일기가 완성되었어요!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img
                src={generatedEntry.imageUrl || "/placeholder.svg"}
                alt={generatedEntry.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{generatedEntry.title}</h3>
                <p className="text-gray-700 leading-relaxed">{generatedEntry.content}</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white"
                >
                  일기 저장하기
                </Button>
                <Button onClick={() => setStep("input")} variant="outline" className="flex-1 border-gray-300">
                  다시 작성하기
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
