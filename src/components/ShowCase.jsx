'use client'

import { useState } from "react"
import { styled } from "styled-components"
import TshirtShowcase from "./TshirtShowcase"
import TshirtLogo from "./TshirtLogo"
import { Toggle } from "@/components/ui/toggle"
import { Palette, Zap, Move } from 'lucide-react'

export default function ShowCase() {
  const [sliderValue, setSliderValue] = useState({ x: 0, y: 0 })
  const [textInput, setTextInput] = useState("")
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isToggled, setIsToggled] = useState(1)
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false)
  const [isSliderPanelOpen, setIsSliderPanelOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")

  const handleToggle = (pressed) => {
    setIsToggled(pressed ? 1 : 0)
  }

  const handleColorToggle = (pressed) => {
    setIsColorPanelOpen(pressed)
  }

  const handleSliderToggle = (pressed) => {
    setIsSliderPanelOpen(pressed)
  }

  const handleXChange = (newXValue) => {
    setSliderValue((prev) => ({ ...prev, x: newXValue }))
  }

  const handleYChange = (newYValue) => {
    setSliderValue((prev) => ({ ...prev, y: newYValue }))
  }

  const resetSliderValues = () => {
    setSliderValue({ x: 0, y: 0 })
  }

  const textureOffset = `${sliderValue.x}:${sliderValue.y}`

  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const openPopup = () => setIsPopupOpen(true)
  const closePopup = () => setIsPopupOpen(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: textInput }),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const blob = await response.blob()
      const imgUrl = URL.createObjectURL(blob)
      setImageUrl(imgUrl)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const colors = ["#000000", "#FFFFFF", "#2C2C2C", "#36454F", "#c48d00"];

  return (
    <ShowcaseContainer>
      <TshirtLogo
        imageUrl={imageUrl}
        loading={loading}
        sliderValue={sliderValue}
        toggled={isToggled}
        color={selectedColor}
      />
      <ControlPanel>
        <ToggleSection>
          <Toggle
            aria-label="Toggle random feature"
            pressed={isToggled === 1}
            onPressedChange={handleToggle}
          >
            <Zap className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Toggle color panel"
            pressed={isColorPanelOpen}
            onPressedChange={handleColorToggle}
          >
            <Palette className="h-4 w-4" />
          </Toggle>
          <Toggle
            aria-label="Toggle position sliders"
            pressed={isSliderPanelOpen}
            onPressedChange={handleSliderToggle}
          >
            <Move className="h-4 w-4" />
          </Toggle>
        </ToggleSection>
        <ButtonSection>
          <StyledButton onClick={openPopup}>Styles</StyledButton>
          <StyledButton>Size</StyledButton>
          <StyledButton onClick={resetSliderValues}>Reset</StyledButton>
        </ButtonSection>
        <InputSection>
          <Input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Customize text..."
            aria-label="Customize text"
          />
          <SubmitButton onClick={handleSubmit} disabled={loading}>
            {loading ? "Generating..." : "Apply"}
          </SubmitButton>
        </InputSection>
      </ControlPanel>

      {isColorPanelOpen && (
        <ColorPanel>
          {colors.map((color) => (
            <ColorButton
              key={color}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </ColorPanel>
      )}

      {isSliderPanelOpen && (
        <SliderPanel>
          <SliderContainer>
            <label htmlFor="x-slider" className="sr-only">
              Adjust X position
            </label>
            <input
              id="x-slider"
              type="range"
              value={sliderValue.x}
              onChange={(e) => handleXChange(e.target.value)}
              min="0"
              max="1"
              step="0.01"
              aria-label="Adjust X position"
            />
            <span>X: {sliderValue.x}</span>
          </SliderContainer>
          <SliderContainer>
            <label htmlFor="y-slider" className="sr-only">
              Adjust Y position
            </label>
            <input
              id="y-slider"
              type="range"
              value={sliderValue.y}
              onChange={(e) => handleYChange(e.target.value)}
              min="0"
              max="1"
              step="0.01"
              aria-label="Adjust Y position"
            />
            <span>Y: {sliderValue.y}</span>
          </SliderContainer>
        </SliderPanel>
      )}

      {error && <ErrorMessage role="alert">{error}</ErrorMessage>}
    </ShowcaseContainer>
  )
}

const ShowcaseContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f0f0f0;
`

const ControlPanel = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  z-index: 10;
  gap: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 1200px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    padding: 1.5rem;
  }
`

const ToggleSection = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`

const ButtonSection = styled.div`
  display: flex;
  gap: 0.75rem;

  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`

const InputSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const StyledButton = styled.button`
  padding: 0.75rem 1.25rem;
  font-size: 14px;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex: 1;
  }
`

const Input = styled.input`
  padding: 0.75rem 1rem;
  width: 200px;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`

const SubmitButton = styled(StyledButton)`
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 600;

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

const ErrorMessage = styled.p`
  color: #ff6b6b;
  text-align: center;
  margin-top: 1rem;
  font-size: 14px;
`

const ColorPanel = styled.div`
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  z-index: 11;
`

const ColorButton = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`

const SliderPanel = styled.div`
  position: fixed;
  bottom: 6rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  z-index: 11;
`

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="range"] {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      background: #ffffff;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  span {
    min-width: 40px;
    text-align: center;
  }
`