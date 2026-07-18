export default function TopicLoading() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] flex justify-center px-6 py-16 bg-white animate-pulse">
      <div className="w-full max-w-3xl">
        {/* Fake Back Button */}
        <div className="w-24 h-4 bg-slate-100 rounded mb-10"></div>
        
        {/* Fake Header */}
        <div className="mb-10">
          <div className="w-16 h-5 bg-slate-100 rounded-full mb-4"></div>
          <div className="w-64 h-10 bg-slate-100 rounded mb-2"></div>
          <div className="w-96 h-4 bg-slate-100 rounded"></div>
        </div>

        {/* Fake Tabs */}
        <div className="flex gap-4 border-b border-slate-100 mb-10 pb-4">
          <div className="w-32 h-4 bg-slate-100 rounded"></div>
          <div className="w-32 h-4 bg-slate-100 rounded"></div>
        </div>

        {/* Fake Content Area */}
        <div className="space-y-4">
          <div className="w-full h-4 bg-slate-100 rounded"></div>
          <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
          <div className="w-4/6 h-4 bg-slate-100 rounded"></div>
        </div>
      </div>
    </div>
  );
}