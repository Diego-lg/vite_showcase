"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TshirtShowcase from "./TshirtShowcase";
import TshirtLogo from "./TshirtLogo";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Palette,
  Zap,
  Move,
  ChevronUp,
  Undo,
  Redo,
  Eye,
  Save,
  Upload,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function ShowCase() {
  const [sliderValue, setSliderValue] = useState({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isToggled, setIsToggled] = useState(1);
  const [activePanel, setActivePanel] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [customColor, setCustomColor] = useState("#000000");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [previewMode, setPreviewMode] = useState(false);
  const controlPanelRef = useRef(null);

  const handleToggle = (pressed) => {
    setIsToggled(pressed ? 1 : 0);
    addToHistory();
  };

  const handlePanelToggle = (panel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleSliderChange = (axis, value) => {
    setSliderValue((prev) => ({ ...prev, [axis]: value[0] }));
    addToHistory();
  };

  const resetSliderValues = () => {
    setSliderValue({ x: 0, y: 0 });
    addToHistory();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: textInput }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const imgUrl = URL.createObjectURL(blob);
      setImageUrl(imgUrl);
      addToHistory();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    addToHistory();
  };

  const handleCustomColorChange = (e) => {
    setCustomColor(e.target.value);
    setSelectedColor(e.target.value);
    addToHistory();
  };

  const addToHistory = () => {
    const currentState = {
      sliderValue,
      textInput,
      imageUrl,
      isToggled,
      selectedColor,
    };
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), currentState]);
    setHistoryIndex((prev) => prev + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      const prevState = history[historyIndex - 1];
      setSliderValue(prevState.sliderValue);
      setTextInput(prevState.textInput);
      setImageUrl(prevState.imageUrl);
      setIsToggled(prevState.isToggled);
      setSelectedColor(prevState.selectedColor);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      const nextState = history[historyIndex + 1];
      setSliderValue(nextState.sliderValue);
      setTextInput(nextState.textInput);
      setImageUrl(nextState.imageUrl);
      setIsToggled(nextState.isToggled);
      setSelectedColor(nextState.selectedColor);
    }
  };

  const togglePreviewMode = () => {
    setPreviewMode((prev) => !prev);
  };

  const saveDesign = () => {
    const design = {
      sliderValue,
      textInput,
      imageUrl,
      isToggled,
      selectedColor,
    };
    localStorage.setItem("tshirtDesign", JSON.stringify(design));
    alert("Design saved successfully!");
  };

  const loadDesign = () => {
    const savedDesign = localStorage.getItem("tshirtDesign");
    if (savedDesign) {
      const design = JSON.parse(savedDesign);
      setSliderValue(design.sliderValue);
      setTextInput(design.textInput);
      setImageUrl(design.imageUrl);
      setIsToggled(design.isToggled);
      setSelectedColor(design.selectedColor);
      addToHistory();
      alert("Design loaded successfully!");
    } else {
      alert("No saved design found.");
    }
  };

  const colors = ["#000000", "#FFFFFF", "#808080", "#C0C0C0", "#404040"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        controlPanelRef.current &&
        !controlPanelRef.current.contains(event.target) &&
        !event.target.closest('[role="dialog"]')
      ) {
        setActivePanel(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <TshirtLogo
        imageUrl={imageUrl}
        loading={loading}
        sliderValue={sliderValue}
        toggled={isToggled}
        color={selectedColor}
      />
      {!previewMode && (
        <div
          ref={controlPanelRef}
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white/20 to-white/10 backdrop-filter backdrop-blur-xl rounded-t-3xl shadow-2xl border border-white/20"
        >
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex space-x-2">
                <Toggle
                  aria-label="Toggle random feature"
                  pressed={isToggled === 1}
                  onPressedChange={handleToggle}
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  <Zap className="h-4 w-4" />
                </Toggle>
                <Toggle
                  aria-label="Toggle color panel"
                  pressed={activePanel === "color"}
                  onPressedChange={() => handlePanelToggle("color")}
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  <Palette className="h-4 w-4" />
                </Toggle>
                <Toggle
                  aria-label="Toggle position sliders"
                  pressed={activePanel === "slider"}
                  onPressedChange={() => handlePanelToggle("slider")}
                  className="data-[state=on]:bg-white data-[state=on]:text-black"
                >
                  <Move className="h-4 w-4" />
                </Toggle>
              </div>
              <div className="w-1/3 mx-4">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Customize text..."
                    className="flex-1 bg-transparent border-white text-white placeholder-gray-400"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {loading ? "Generating..." : "Apply"}
                  </Button>
                </form>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="text-white hover:bg-white/10"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="text-white hover:bg-white/10"
                >
                  <Redo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePreviewMode}
                  className="text-white hover:bg-white/10"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveDesign}
                  className="text-white hover:bg-white/10"
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDesign}
                  className="text-white hover:bg-white/10"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                    >
                      Styles
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-gray-900 text-white border-l border-white/20">
                    <h3 className="text-lg font-semibold mb-4">Styles</h3>
                    <p>This is where you would put your styles content.</p>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            <AnimatePresence>
              {activePanel === "color" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex justify-center space-x-4 items-center"
                >
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className="w-8 h-8 rounded-full border-2 border-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white"
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-8 h-8 rounded-full p-0 border-2 border-white overflow-hidden"
                      >
                        <div className="w-full h-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="w-32 h-32"
                      />
                    </PopoverContent>
                  </Popover>
                </motion.div>
              )}
              {activePanel === "slider" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label htmlFor="x-slider" className="text-sm font-medium">
                      X Position: {sliderValue.x.toFixed(2)}
                    </label>
                    <Slider
                      id="x-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[sliderValue.x]}
                      onValueChange={(value) => handleSliderChange("x", value)}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="y-slider" className="text-sm font-medium">
                      Y Position: {sliderValue.y.toFixed(2)}
                    </label>
                    <Slider
                      id="y-slider"
                      min={0}
                      max={1}
                      step={0.01}
                      value={[sliderValue.y]}
                      onValueChange={(value) => handleSliderChange("y", value)}
                      className="w-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg"
        >
          {error}
        </div>
      )}
      {previewMode && (
        <Button
          variant="outline"
          size="sm"
          onClick={togglePreviewMode}
          className="fixed bottom-4 right-4 text-white border-white hover:bg-white hover:text-black"
        >
          Exit Preview
        </Button>
      )}
    </div>
  );
}
