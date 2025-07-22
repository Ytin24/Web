export default function FloatingElements() {
  return (
    <>
      <div className="absolute top-20 left-20 animate-float">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[hsl(340,100%,69%)]/30 to-[hsl(252,100%,71%)]/30 glass-effect animate-bloom"></div>
      </div>
      <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(74,64%,59%)]/30 to-[hsl(340,100%,69%)]/30 glass-effect animate-bloom"></div>
      </div>
      <div className="absolute bottom-32 left-40 animate-float" style={{ animationDelay: '4s' }}>
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[hsl(252,100%,71%)]/30 to-[hsl(74,64%,59%)]/30 glass-effect animate-bloom"></div>
      </div>
    </>
  );
}
