export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#1a1a18] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NF</span>
            </div>
            <span className="text-xl font-semibold text-[#1a1a18]">NombaFlow</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
