// Board layout — no sidebar, just the full screen board
export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {children}
    </div>
  );
}
