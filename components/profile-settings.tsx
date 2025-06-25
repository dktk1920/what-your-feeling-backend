"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Bell, Shield, LogOut, Edit2, Check, X } from "lucide-react"

interface ProfileSettingsProps {
  user: {
    nickname: string
    loginMethod: string
    isAnonymous: boolean
  }
  onLogout: () => void
}

export default function ProfileSettings({ user, onLogout }: ProfileSettingsProps) {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [nickname, setNickname] = useState(user.nickname)
  const [tempNickname, setTempNickname] = useState(user.nickname)
  const [notifications, setNotifications] = useState(true)
  const [notificationTime, setNotificationTime] = useState("20:00")

  const handleSaveNickname = () => {
    setNickname(tempNickname)
    setIsEditingNickname(false)
  }

  const handleCancelEdit = () => {
    setTempNickname(nickname)
    setIsEditingNickname(false)
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-800">이게 너야!</h1>
          <p className="text-gray-600">너에 대한 정보야 잘 확인해~</p>
        </div>

        {/* Profile Information */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-amber-600" />
              <span>프로필 정보</span>
            </CardTitle>
            <CardDescription>네 이름이 이거 맞지?!</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Nickname */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">닉네임</label>
              <div className="flex items-center space-x-2">
                {isEditingNickname ? (
                  <>
                    <Input
                      value={tempNickname}
                      onChange={(e) => setTempNickname(e.target.value)}
                      className="flex-1 rounded-lg border-gray-200 focus:border-amber-300 focus:ring-amber-200"
                    />
                    <Button
                      size="sm"
                      onClick={handleSaveNickname}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="border-gray-300">
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 px-3 py-2 bg-gray-50 rounded-lg text-gray-800">{nickname}</div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingNickname(true)}
                      className="border-gray-300"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Login Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">로그인 방법</label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-600">
                {user.loginMethod}으로 로그인됨
                {user.isAnonymous && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">익명</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span>내 연락 받아줘~</span>
            </CardTitle>
            <CardDescription>내 연락 안읽는거 아니지..?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">푸시 알림</label>
                <p className="text-xs text-gray-500">일일 체크인 및 상담 알림을 받습니다</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            {/* Notification Time */}
            {notifications && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">선톡 할게</label>
                <Select value={notificationTime} onValueChange={setNotificationTime}>
                  <SelectTrigger className="rounded-lg border-gray-200 focus:border-amber-300 focus:ring-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">오전 9:00</SelectItem>
                    <SelectItem value="12:00">오후 12:00</SelectItem>
                    <SelectItem value="18:00">오후 6:00</SelectItem>
                    <SelectItem value="20:00">오후 8:00</SelectItem>
                    <SelectItem value="21:00">오후 10:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <span>우리만의 비밀</span>
            </CardTitle>
            <CardDescription>너와 나만의 비밀이야</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-medium text-amber-800 mb-2">데이터 보호</h4>
              <p className="text-xs text-amber-700 leading-relaxed">
                모든 대화 내용은 암호화되어 저장하고, 개인정보는 대화 목적으로만 사용하고 있어. 언제든지 계정 삭제를 통해
                모든 데이터를 완전히 제거할 수 있으니까 편하게 말해도 돼.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              계정 및 데이터 삭제
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
            >
              <LogOut className="w-5 h-5 mr-2" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
