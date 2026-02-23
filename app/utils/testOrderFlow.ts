// Test utility to verify order flow
import orderService from '../services/order'

export async function testOrderFlow() {
  console.log('🧪 Testing Order Flow...')
  
  try {
    // Test data matching the checkout form
    const testOrderData = {
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com',
      customer_phone: '1234567890',
      shipping_address: '123 Main Street, Amsterdam, 1000AB, Netherlands',
      payment_method: 'bank_transfer' as const,
      items: [
        {
          product_id: 5, // BMW Oil Filter
          quantity: 2
        },
        {
          product_id: 7, // BMW Cabin Air Filter
          quantity: 1
        }
      ]
    }
    
    console.log('📤 Sending test order:', testOrderData)
    
    const result = await orderService.createOrder(testOrderData)
    
    if (result.success) {
      console.log('✅ Order created successfully!')
      console.log('📋 Order details:', result.data)
      return result
    } else {
      console.error('❌ Order failed:', result.message)
      console.error('🔍 Errors:', result.errors)
      return result
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error)
    throw error
  }
}

// Helper function to test API connectivity
export async function testApiConnectivity() {
  console.log('🔌 Testing API connectivity...')
  
  try {
    const response = await fetch('http://localhost:8000/api/health')
    const data = await response.json()
    
    if (data.status === 'ok') {
      console.log('✅ API is healthy')
      return true
    } else {
      console.error('❌ API health check failed')
      return false
    }
  } catch (error) {
    console.error('💥 API connectivity test failed:', error)
    return false
  }
}
