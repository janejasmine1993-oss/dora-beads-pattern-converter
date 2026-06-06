import { useState } from 'react'

interface ExistingPatternImportPanelProps {
  onImageLoad: (url: string, file: File) => void
}

export function ExistingPatternImportPanel({ onImageLoad }: ExistingPatternImportPanelProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('pattern-image')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onImageLoad(url, file)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">导入既有图纸</h3>

      <div className="space-y-2">
        <p className="text-xs text-gray-600">选择图纸格式：</p>
        {[
          { id: 'pattern-image', label: '图纸 PNG / JPG（带网格）', desc: '已生成的拼豆图纸截图' },
          { id: 'pixel-grid', label: '像素格子图', desc: '黑白像素格子，自动识别' },
          { id: 'reference', label: '参考照片', desc: '拼豆作品照片，重新设计' },
        ].map(fmt => (
          <label key={fmt.id} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: selectedFormat === fmt.id ? '#3b82f6' : '#e5e7eb', backgroundColor: selectedFormat === fmt.id ? '#eff6ff' : 'white' }}
          >
            <input
              type="radio"
              name="format"
              value={fmt.id}
              checked={selectedFormat === fmt.id}
              onChange={e => setSelectedFormat(e.target.value)}
              className="w-4 h-4"
            />
            <div className="ml-2 flex-1">
              <p className="text-xs font-medium text-gray-700">{fmt.label}</p>
              <p className="text-[10px] text-gray-500">{fmt.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div>
        <label className="text-xs text-gray-600 block mb-2">上传图纸文件：</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full text-xs file:mr-2 file:px-2 file:py-1 file:rounded file:border file:border-gray-300 file:text-xs file:text-gray-600 hover:file:border-blue-400"
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-3 space-y-2">
        <p className="text-xs font-medium text-blue-900">使用流程：</p>
        <ol className="text-[10px] text-blue-800 space-y-1 list-decimal list-inside">
          <li>上传既有图纸截图或参考照片</li>
          <li>系统自动识别网格、色号和布局（v0.5.1+）</li>
          <li>还原为可编辑的拼豆矩阵</li>
          <li>在编辑器中修改设计并重新导出</li>
        </ol>
      </div>

      <p className="text-[10px] text-gray-400">
        图纸识别和 OCR 功能将在后续版本实现
      </p>
    </div>
  )
}
