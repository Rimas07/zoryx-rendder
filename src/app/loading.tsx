export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#622ADA] to-[#0070BB]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="w-48 h-48 object-cover rounded-full"
      >
        <source
          src="/PixVerse_V6_Image_Text_360P_Minimal_logo_anima.mp4"
          type="video/mp4"
        />
      </video>
    </div>
  );
}

