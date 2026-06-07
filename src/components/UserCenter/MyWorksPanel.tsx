import { useState } from 'react'
import type { UserWork } from '../../types/work'

interface MyWorksPanelProps {
  isLoggedIn: boolean
  works: UserWork[]
  onSaveMockWork: () => void
  onDeleteWork: (id: string) => void
  onRenameWork: (id: string, title: string) => void
}

export function MyWorksPanel({
  isLoggedIn,
  works,
  onSaveMockWork,
  onDeleteWork,
  onRenameWork,
}: MyWorksPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  if (!isLoggedIn) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 opacity-50">
        <p className="text-gray-500 text-sm">请先登录查看我的作品</p>
      </div>
    )
  }

  const handleStartEdit = (work: UserWork) => {
    setEditingId(work.id)
    setEditingTitle(work.title)
  }

  const handleSaveEdit = (id: string) => {
    if (editingTitle.trim()) {
      onRenameWork(id, editingTitle)
    }
    setEditingId(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">我的作品</h3>

      <button
        onClick={onSaveMockWork}
        className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition mb-3"
      >
        保存当前作品（Mock）
      </button>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {works.length === 0 ? (
          <p className="text-center text-gray-500 text-xs py-4">暂无保存的作品</p>
        ) : (
          works.map(work => (
            <div key={work.id} className="p-3 bg-gray-50 border border-gray-200 rounded text-xs">
              <div className="flex justify-between items-start mb-2">
                {editingId === work.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={e => setEditingTitle(e.target.value)}
                    autoFocus
                    className="flex-1 px-2 py-1 border border-blue-300 rounded text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveEdit(work.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                  />
                ) : (
                  <span className="font-semibold text-gray-900 flex-1 cursor-pointer hover:text-blue-600"
                    onClick={() => handleStartEdit(work)}>
                    {work.title}
                  </span>
                )}
                <div className="flex gap-1 ml-2">
                  {editingId === work.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(work.id)}
                        className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onDeleteWork(work.id)}
                      className="px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 text-xs"
                    >
                      删除
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1 text-gray-600">
                <span>尺寸：{work.patternSize.width}×{work.patternSize.height}</span>
                <span>品牌：{work.beadBrand}</span>
                <span>颜色：{work.colorCount}</span>
                <span>豆数：{work.totalBeads}</span>
                <span className="col-span-2 text-gray-500">{new Date(work.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200">
        💡 当前为 mock 模式，仅保存元数据不保存完整图纸数据
      </p>
    </div>
  )
}
