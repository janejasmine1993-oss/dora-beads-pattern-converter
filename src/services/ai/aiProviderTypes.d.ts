import type { AiPreset } from '../../types/aiStyle';
export interface AiImageInput {
    name: string;
    type: string;
    size: number;
    base64?: string;
    url?: string;
}
export interface RealAiStyleRequest {
    userId: string;
    presetId: AiPreset;
    sourceImage: AiImageInput;
    prompt?: string;
    strength: number;
    keepOriginalColors: boolean;
    targetUseCase: 'bead-pattern' | 'poster' | 'avatar' | 'reference';
}
export interface RealAiStyleResult {
    id: string;
    provider: 'mock' | 'tencent-hunyuan' | 'volcengine-seedream' | 'aliyun-wanxiang' | 'openai';
    status: 'pending' | 'processing' | 'success' | 'failed';
    presetId: AiPreset;
    resultImageUrl?: string;
    resultImageBase64?: string;
    message: string;
    errorMessage?: string;
    creditCost: number;
    createdAt: string;
}
export interface AiProvider {
    name: string;
    call(request: RealAiStyleRequest): Promise<RealAiStyleResult>;
}
//# sourceMappingURL=aiProviderTypes.d.ts.map