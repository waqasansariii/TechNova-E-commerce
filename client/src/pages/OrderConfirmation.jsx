import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function OrderConfirmation({ order, onContinueShopping }) {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const transactionId = query.get('txnRef');

  return (
    <motion.div
      className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-lg sm:max-w-xl md:max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 text-center">
        <motion.div
          className="mb-6"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Order Confirmed!</h2>
        <p className="text-gray-600 mb-4 text-sm sm:text-base">Thank you for your purchase. Your order has been received and is being processed.</p>
        {transactionId && (
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Transaction ID: {transactionId}</p>
        )}

        {order && (
          <>
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Order Summary</h3>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.product._id} className="flex justify-between text-sm sm:text-base">
                    <span>{item.product.name} × {item.quantity}</span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 font-semibold flex justify-between text-sm sm:text-base">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold mb-2 text-sm sm:text-base">Shipping Information</h3>
              <p className="text-sm sm:text-base">{order.shipping.name}</p>
              <p className="text-sm sm:text-base">{order.shipping.address}</p>
              <p className="text-sm sm:text-base">{order.shipping.city}, {order.shipping.state} {order.shipping.zip}</p>
              <p className="text-sm sm:text-base mt-2">{order.shipping.email}</p>
            </div>
          </>
        )}

        <motion.button
          onClick={() => {
            onContinueShopping();
            navigate('/');
          }}
          className="px-4 sm:px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Continue Shopping
        </motion.button>
      </div>
    </motion.div>
  );
}

export default OrderConfirmation;