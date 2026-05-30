'use client'

import { useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'
import { InputField } from '@/shared/ui/InputField'
import { TextareaField } from '@/shared/ui/TextareaField'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Switch } from '@/shared/ui/Switch'
import { Label } from '@/shared/ui/Label'
import { SearchBar } from '@/shared/ui/SearchBar'

const Section = ({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) => (
  <section className="flex flex-col gap-4 rounded-2xl border border-[#e4e4e4] bg-white p-6">
    <h2 className="text-lg font-bold text-text-primary">{title}</h2>
    {children}
  </section>
)

const TestInputsPage = () => {
  const [selectValue, setSelectValue] = useState('')
  const [checked, setChecked] = useState(false)
  const [switchOn, setSwitchOn] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="mx-auto flex max-w-[40rem] flex-col gap-8 px-5 py-10">
      <h1 className="text-2xl font-bold text-text-primary">
        Input Components
      </h1>

      {/* Input */}
      <Section title="Input">
        <div className="flex flex-col gap-3">
          <Input placeholder="Default" />
          <Input defaultValue="입력된 값" />
          <Input placeholder="Focus 상태는 클릭해보세요" />
          <Input placeholder="Disabled" disabled />
          <Input placeholder="Error" state="error" />
          <Input type="password" placeholder="비밀번호" />
          <Input type="number" placeholder="숫자 입력" />
        </div>
      </Section>

      {/* InputField (Label + Input 조합) */}
      <Section title="InputField">
        <div className="flex flex-col gap-3">
          <InputField label="이메일" required>
            <Input placeholder="이메일을 입력해주세요" />
          </InputField>
          <InputField label="닉네임">
            <Input placeholder="닉네임을 입력해주세요" />
          </InputField>
          <InputField label="비밀번호" required error="8자 이상 입력해주세요">
            <Input type="password" placeholder="비밀번호" state="error" />
          </InputField>
        </div>
      </Section>

      {/* Textarea */}
      <Section title="Textarea">
        <div className="flex flex-col gap-3">
          <Textarea placeholder="내용을 입력해주세요" rows={4} />
          <Textarea placeholder="Disabled" rows={3} disabled />
          <Textarea placeholder="Error" rows={3} state="error" />
        </div>
      </Section>

      {/* TextareaField (Label + Textarea + Counter) */}
      <Section title="TextareaField">
        <div className="flex flex-col gap-3">
          <TextareaField
            label="자기소개"
            required
            placeholder="성별, 연령대, 거주지 등"
            maxLength={100}
            currentLength={0}
          />
          <TextareaField
            label="비고"
            placeholder="추가 정보를 입력해주세요"
            maxLength={100}
            currentLength={42}
          />
          <TextareaField
            label="오류 상태"
            required
            placeholder="입력해주세요"
            maxLength={100}
            currentLength={105}
            error="100자를 초과했습니다"
          />
        </div>
      </Section>

      {/* Select */}
      <Section title="Select">
        <div className="flex flex-col gap-3">
          <Select value={selectValue} onValueChange={setSelectValue}>
            <SelectTrigger>
              <SelectValue placeholder="항목을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">강아지</SelectItem>
              <SelectItem value="cat">고양이</SelectItem>
              <SelectItem value="bird">새</SelectItem>
            </SelectContent>
          </Select>
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Disabled" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      {/* Checkbox */}
      <Section title="Checkbox">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="check1"
              checked={checked}
              onCheckedChange={(v) => setChecked(v as boolean)}
            />
            <Label htmlFor="check1">
              동의합니다 (checked: {String(checked)})
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="check-default" defaultChecked />
            <Label htmlFor="check-default">기본 체크됨</Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox id="check-disabled" disabled />
            <Label htmlFor="check-disabled">비활성화</Label>
          </div>
        </div>
      </Section>

      {/* Switch */}
      <Section title="Switch">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Switch
              id="switch1"
              checked={switchOn}
              onCheckedChange={setSwitchOn}
            />
            <Label htmlFor="switch1">
              알림 받기 (on: {String(switchOn)})
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="switch-default" defaultChecked />
            <Label htmlFor="switch-default">기본 켜짐</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="switch-disabled" disabled />
            <Label htmlFor="switch-disabled">비활성화</Label>
          </div>
        </div>
      </Section>

      {/* SearchBar */}
      <Section title="SearchBar">
        <div className="flex flex-col gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(q) => alert(`검색: ${q}`)}
          />
          <p className="text-sm text-[#a8a8a8]">
            현재 입력값: &quot;{searchQuery}&quot;
          </p>
        </div>
      </Section>
    </div>
  )
}

export default TestInputsPage
