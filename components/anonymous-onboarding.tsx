"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, User, Calendar } from "lucide-react"

interface AnonymousOnboardingProps {
  onComplete: (userData: {
    nickname: string
    loginMethod: string
    isAnonymous: boolean
    gender: string
    age: number
  }) => void
  onBack: () => void
}

export default function AnonymousOnboarding({ onComplete, onBack }: AnonymousOnboardingProps) {
  const [gender, setGender] = useState<string>("")
  const [age, setAge] = useState<string>("")

  const handleComplete = () => {
    if (!gender || !age) return

    onComplete({
      nickname: `익명 사용자`,
      loginMethod: "익명",
      isAnonymous: true,
      gender,
      age: Number.parseInt(age),
    })
  }

  const generateAgeOptions = () => {
    const options = []
    for (let i = 13; i <= 80; i++) {
      options.push(
        <SelectItem key={i} value={i.toString()}>
          {i}세
        </SelectItem>,
      )
    }
    return options
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">내 이야기를 아무도 몰랐으면</h1>
            <p className="text-gray-600">우리가 너를 어떤 사람으로 보고 말상대가 되어줄까?</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg text-gray-800">이것만 알려줘</CardTitle>
            <CardDescription className="text-gray-600">
              너에 대해 아무도 모를거야, 그저 너를 위한 스타일을 찾아줄게
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Gender Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <User className="w-4 h-4 mr-2 text-amber-600" />
                성별
              </label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl">
                  <SelectValue placeholder="성별을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Age Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-amber-600" />
                나이
              </label>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-amber-300 focus:ring-amber-200 rounded-xl">
                  <SelectValue placeholder="나이를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="max-h-60">{generateAgeOptions()}</SelectContent>
              </Select>
            </div>

            {/* Complete Button */}
            <Button
              onClick={handleComplete}
              disabled={!gender || !age}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              상담 시작하기
            </Button>

            {/* Privacy Notice */}
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800 leading-relaxed">
                🔒 개인정보 보호: 네가 누군지는 우리도 몰라
                그저 지금 이 순간 네가 조금이라도 편했으면 좋겠어.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
