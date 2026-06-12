export interface PaymentOrder {
  orderId: string
  userId: string
  amount: number
  currency: 'CNY' | 'USD'
  paymentMethod: 'wxpay' | 'alipay' | 'stripe'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  description: string
  createdAt: number
  completedAt?: number
  metadata?: Record<string, unknown>
}

export interface PaymentCallback {
  orderId: string
  transactionId: string
  amount: number
  status: 'success' | 'failed'
  timestamp: number
  signature: string
}

export interface IPaymentService {
  createOrder(userId: string, amount: number, description: string): Promise<PaymentOrder>
  getOrder(orderId: string): Promise<PaymentOrder | null>
  getPaymentUrl(orderId: string): Promise<string>
  verifyPayment(orderId: string, transactionId: string): Promise<boolean>
  refund(orderId: string, reason: string): Promise<boolean>
  handleCallback(callback: PaymentCallback): Promise<void>
}

export class MockPaymentService implements IPaymentService {
  private orders: Map<string, PaymentOrder> = new Map()
  private orderCounter = 0

  async createOrder(userId: string, amount: number, description: string): Promise<PaymentOrder> {
    const orderId = `order-${++this.orderCounter}`
    const order: PaymentOrder = {
      orderId,
      userId,
      amount,
      currency: 'CNY',
      paymentMethod: 'wxpay',
      status: 'pending',
      description,
      createdAt: Date.now(),
    }
    this.orders.set(orderId, order)
    return order
  }

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    return this.orders.get(orderId) || null
  }

  async getPaymentUrl(orderId: string): Promise<string> {
    const order = this.orders.get(orderId)
    if (!order) throw new Error('Order not found')
    return `https://payment.example.com/pay?orderId=${orderId}&amount=${order.amount}`
  }

  async verifyPayment(orderId: string, _transactionId: string): Promise<boolean> {
    const order = this.orders.get(orderId)
    if (!order) return false

    order.status = 'completed'
    order.completedAt = Date.now()
    this.orders.set(orderId, order)
    return true
  }

  async refund(orderId: string, _reason: string): Promise<boolean> {
    const order = this.orders.get(orderId)
    if (!order || order.status !== 'completed') return false

    order.status = 'refunded'
    this.orders.set(orderId, order)
    return true
  }

  async handleCallback(callback: PaymentCallback): Promise<void> {
    const order = this.orders.get(callback.orderId)
    if (!order) throw new Error('Order not found')

    if (callback.status === 'success') {
      order.status = 'completed'
      order.completedAt = Date.now()
    } else {
      order.status = 'failed'
    }
    this.orders.set(callback.orderId, order)
  }
}

let paymentService: IPaymentService | null = null

export function getPaymentService(): IPaymentService {
  if (!paymentService) {
    paymentService = new MockPaymentService()
  }
  return paymentService
}

export function setPaymentService(service: IPaymentService): void {
  paymentService = service
}
