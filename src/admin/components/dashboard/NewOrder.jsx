import React from 'react'

const NewOrder = () => {
  return (
    <div>
      {/* New Order Notification */}
      <div className="fixed bottom-6 right-6 max-w-xs">
        <div className="flex items-center justify-between bg-green-100 p-4 rounded-md shadow-md">
          <div>
            <h3 className="font-medium text-green-800">New Order</h3>
            <p className="text-sm text-green-700">Order #1234 placed 10 minutes ago</p>
          </div>
          <button className="text-green-700 hover:text-green-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewOrder
