export default function TrackLoading() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white animate-pulse">
      <div className="w-full max-w-3xl">
        {/* Fake Back Button */}
        <div className="w-24 h-4 bg-slate-100 rounded mb-10"></div>
        
        {/* Fake Header */}
        <div className="mb-12">
          <div className="w-64 h-10 bg-slate-100 rounded mb-4"></div>
          <div className="w-96 h-4 bg-slate-100 rounded"></div>
        </div>

        {/* Fake Topic Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="block p-6 border border-slate-100 rounded-xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="w-48 h-6 bg-slate-100 rounded mb-2"></div>
                  <div className="w-72 h-4 bg-slate-100 rounded"></div>
                </div>
                <div className="w-20 h-4 bg-slate-100 rounded"></div>
              </div>
              <div className="w-full h-[3px] bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}