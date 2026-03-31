export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#622ADA] to-[#0070BB]">
      <video autoPlay loop muted playsInline className="w-48 h-48 object-cover rounded-full">
        <source
          src="https://gsprqyfmodotiezvopiq.supabase.co/storage/v1/object/sign/fdsfds/PixVerse_V6_Image_Text_360P_Minimal_logo_anima.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV84YzU3Y2M3MS05YTk1LTQ3NzUtYTI2ZC04MDc3OTAwNTU3ZmUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmZHNmZHMvUGl4VmVyc2VfVjZfSW1hZ2VfVGV4dF8zNjBQX01pbmltYWxfbG9nb19hbmltYS5tcDQiLCJpYXQiOjE3NzQ5ODI0NTcsImV4cCI6MTgwNjUxODQ1N30.Zz3H6t7qHSf6rvjfYp7Sc5ZQw1mIUfPEdpQ4ciNtJew"
          type="video/mp4"
        />
      </video>
    </div>
  );
}
