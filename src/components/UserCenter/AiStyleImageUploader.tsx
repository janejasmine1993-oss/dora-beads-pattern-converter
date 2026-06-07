import { useRef } from 'react'
import type { AiStyleSourceImage } from '../../types/aiStyle'

interface AiStyleImageUploaderProps {
  onImageSelected: (image: AiStyleSourceImage) => void
  selectedImage: AiStyleSourceImage | null
  onClear: () => void
  currentWorkspaceImage?: { url: string; name: string }
  onUseWorkspaceImage?: () => void
}

export function AiStyleImageUploader({
  onImageSelected,
  selectedImage,
  onClear,
  currentWorkspaceImage,
  onUseWorkspaceImage,
}: AiStyleImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file.type.match(/image\/(jpeg|png|webp)/)) {
      alert('请上传 JPG / PNG / WEBP 格式的图片')
      return
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert(`图片大小超过 5MB 限制（当前：${(file.size / 1024 / 1024).toFixed(1)}MB）`)
      return
    }

    const reader = new FileReader()
    reader.onload = e => {
      const result = e.target?.result as string
      // 提取纯 base64（去掉 data:image/..;base64, 前缀）
      const base64Data = result.split(',')[1] || result

      const image: AiStyleSourceImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl: result,
        base64: base64Data,
        createdAt: new Date().toISOString(),
      }

      // 尝试获取图片尺寸
      const img = new Image()
      img.onload = () => {
        image.width = img.naturalWidth
        image.height = img.naturalHeight
        onImageSelected(image)
      }
      img.src = result
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">上传需要 AI 优化的图片</h3>

      <p className="text-xs text-gray-600 mb-4">
        请先上传图片，再选择 AI 优化方式。当前为 mock 模式，不会真实调用 AI API。
      </p>

      {/* 当前工作台图片提示 */}
      {currentWorkspaceImage && !selectedImage && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
          <p className="text-xs text-blue-700 mb-2">✓ 已检测到当前工作台图片，可直接用于 AI 优化</p>
          <button
            onClick={onUseWorkspaceImage}
            className="w-full px-3 py-2 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
          >
            使用当前工作台图片
          </button>
        </div>
      )}

      {/* 上传区 */}
      {!selectedImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition bg-gray-50"
        >
          <p className="text-sm font-medium text-gray-700 mb-1">点击或拖拽上传图片</p>
          <p className="text-xs text-gray-500">支持 JPG / PNG / WEBP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        /* 图片预览 */
        <div className="space-y-3">
          <div className="border border-gray-200 rounded overflow-hidden bg-gray-50">
            <img src={selectedImage.previewUrl} alt={selectedImage.name} className="w-full h-auto max-h-48" />
          </div>

          {/* 图片信息 */}
          <div className="text-xs text-gray-600 space-y-1">
            <p>
              <span className="font-semibold">文件名：</span>
              {selectedImage.name}
            </p>
            <p>
              <span className="font-semibold">文件大小：</span>
              {(selectedImage.size / 1024).toFixed(1)} KB
            </p>
            {selectedImage.width && selectedImage.height && (
              <p>
                <span className="font-semibold">尺寸：</span>
                {selectedImage.width} × {selectedImage.height} px
              </p>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-600 rounded text-xs hover:bg-gray-50 transition"
            >
              重新上传
            </button>
            <button
              onClick={onClear}
              className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded text-xs hover:bg-red-50 transition"
            >
              清空图片
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
