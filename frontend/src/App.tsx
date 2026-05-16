import { useState, useRef, type ChangeEvent, type MouseEvent, type TouchEvent } from "react";
import html2canvas from "html2canvas";
import { FaCamera, FaImage, FaTrash, FaUndo } from "react-icons/fa";

export default function App() {
  const [color, setColor] = useState<string>(() => {
    return localStorage.getItem("color") || "8ACE00";
  });
  const [text, setText] = useState<string>("brat");
  const [image, setImage] = useState<string | null>(null);
  
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [imgScale, setImgScale] = useState<number>(1);
  const [imgRotate, setImgRotate] = useState<number>(0);
  const [imgOpacity, setImgOpacity] = useState<number>(1);
  
  const [fontSize, setFontSize] = useState<number>(60);
  const [fontBlur, setFontBlur] = useState<number>(0.6);
  const [fontSpacing, setFontSpacing] = useState<number>(-4);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const artboardRef = useRef<HTMLDivElement>(null);

  function setNewColor(newColor: string) {
    setColor(newColor);
    localStorage.setItem("color", newColor);
  }

  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setPosition({ x: 0, y: 0 });
        setImgScale(1);
        setImgRotate(0);
        setImgOpacity(1);
      };
      reader.readAsDataURL(file);
    }
  }

  function startDrag(clientX: number, clientY: number) {
    if (!image) return;
    setIsDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  }

  function handleDrag(clientX: number, clientY: number) {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }

  function stopDrag() {
    setIsDragging(false);
  }

  function resetImageAdjustments() {
    setPosition({ x: 0, y: 0 });
    setImgScale(1);
    setImgRotate(0);
    setImgOpacity(1);
  }

  async function downloadScreenshot() {
    if (!artboardRef.current) return;
    
    try {
      const canvas = await html2canvas(artboardRef.current, {
        useCORS: true,
        scale: 2
      });
      
      const imageUri = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = imageUri;
      link.download = `${text.toLowerCase().replace(/\s+/g, "-")}-brat.png`;
      link.click();
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  }

  const getFontStyles = (hexColor: string) => {
    switch (hexColor.toUpperCase()) {
      case "8ACE00": 
        return "font-sans font-normal text-black";
      case "EAA1CE": 
        return "font-serif italic font-light text-white";
      case "1E3A8A": 
        return "font-mono font-black text-cyan-400 uppercase";
      case "FF5733": 
        return "font-sans uppercase font-extrabold text-amber-200";
      default:
        return "font-sans font-normal text-black";
    }
  };

  return (
    <div className="min-h-screen w-full bg-zinc-950 flex flex-col lg:flex-row items-center justify-center p-4 gap-6 select-none">
      
      <div 
        ref={artboardRef}
        style={{ backgroundColor: `#${color}` }} 
        className="aspect-square w-full max-w-md border-[14px] border-black flex items-center justify-center p-8 relative overflow-hidden cursor-move shadow-2xl shrink-0"
        onMouseDown={(e: MouseEvent) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e: MouseEvent) => handleDrag(e.clientX, e.clientY)}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={(e: TouchEvent) => {
          if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchMove={(e: TouchEvent) => {
          if (e.touches.length === 1) handleDrag(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onTouchEnd={stopDrag}
      >
        {image && (
          <img
            src={image}
            alt="Uploaded layer"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${imgScale}) rotate(${imgRotate}deg)`,
              opacity: imgOpacity,
            }}
            className="absolute max-w-[70%] max-h-[70%] pointer-events-none object-contain transition-transform duration-75"
          />
        )}

        <div 
          style={{ 
            fontSize: `${fontSize}px`,
            filter: `blur(${fontBlur}px)`,
            letterSpacing: `${fontSpacing}px`
          }}
          className={`lowercase text-center break-all relative z-10 leading-none ${getFontStyles(color)}`}
        >
          {text}
        </div>
      </div>

      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Brat Canvas Text</label>
          <textarea 
            className="w-full px-3 py-2 bg-zinc-950 text-white rounded-xl font-mono text-sm border border-zinc-800 focus:outline-none focus:border-zinc-700 resize-none"
            rows={2}
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Type your text..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Themes</label>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setNewColor("8ACE00")} 
              className="px-3 py-2 bg-[#8ACE00] text-black text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-left"
            >
              🟩 Brat Green
            </button>
            <button 
              onClick={() => setNewColor("EAA1CE")} 
              className="px-3 py-2 bg-[#EAA1CE] text-white text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-left"
            >
              🌸 Brat Pink
            </button>
            <button 
              onClick={() => setNewColor("1E3A8A")} 
              className="px-3 py-2 bg-[#1E3A8A] text-white text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-left"
            >
              🔷 Club Blue
            </button>
            <button 
              onClick={() => setNewColor("FF5733")} 
              className="px-3 py-2 bg-[#FF5733] text-black text-xs font-black rounded-xl hover:opacity-90 transition-opacity text-left"
            >
              🔥 Neon Orange
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1">Text Settings</div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Size ({fontSize}px)</span>
            </div>
            <input type="range" min="20" max="120" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Blur ({fontBlur}px)</span>
            </div>
            <input type="range" min="0" max="3" step="0.1" value={fontBlur} onChange={(e) => setFontBlur(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Spacing ({fontSpacing}px)</span>
            </div>
            <input type="range" min="-12" max="10" value={fontSpacing} onChange={(e) => setFontSpacing(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>

        <div className="flex flex-col gap-3 p-3.5 bg-zinc-950 rounded-xl border border-zinc-800">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-1 flex justify-between items-center">
            <span>Image Overlays</span>
            {image && (
              <div className="flex gap-2">
                <button onClick={resetImageAdjustments} className="text-zinc-500 hover:text-white transition-colors text-xs p-1">
                  <FaUndo />
                </button>
                <button onClick={() => setImage(null)} className="text-red-500 hover:text-red-400 transition-colors text-xs p-1">
                  <FaTrash />
                </button>
              </div>
            )}
          </div>

          {!image ? (
            <label className="w-full py-3 bg-zinc-900 text-zinc-300 font-bold text-xs rounded-xl hover:bg-zinc-800 border border-dashed border-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              <FaImage className="text-base" /> Upload PNG / JPG Image
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Image Size (x{imgScale.toFixed(1)})</span>
                </div>
                <input type="range" min="0.2" max="3" step="0.1" value={imgScale} onChange={(e) => setImgScale(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Rotation ({imgRotate}°)</span>
                </div>
                <input type="range" min="-180" max="180" value={imgRotate} onChange={(e) => setImgRotate(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Opacity ({Math.round(imgOpacity * 100)}%)</span>
                </div>
                <input type="range" min="0" max="1" step="0.1" value={imgOpacity} onChange={(e) => setImgOpacity(Number(e.target.value))} className="w-full accent-white h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={downloadScreenshot}
          className="w-full py-3 mt-2 bg-white text-black font-black text-sm rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 shadow-lg shrink-0"
        >
          <FaCamera className="text-base" /> Export High-Res PNG
        </button>

      </div>
    </div>
  );
}
