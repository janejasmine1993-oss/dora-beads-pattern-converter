interface FeedbackButtonProps {
  onClick: () => void
}

export function FeedbackButton({ onClick }: FeedbackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40 font-medium text-sm"
      title="反馈和留言"
    >
      <span className="text-lg">💬</span>
      <span className="hidden sm:inline">反馈</span>
    </button>
  )
}
