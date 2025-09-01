import { useState } from 'react';
import CartItem from './CartItem';

function CartPopup({ cart, isOpen, onClose, onRemove, onUpdateQuantity, onCheckout }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Initiating checkout...'); // Debug log
      await onCheckout(); // Navigate to /checkout
      console.log('Checkout navigation triggered');
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Failed to proceed to checkout. Please try again or contact support.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-200">
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                cart.map(item => (
                  <CartItem
                    key={item.product._id}
                    item={item}
                    onRemove={onRemove}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))
              )}
            </div>
            {cart.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">Rs {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-4">
                  <span>Total</span>
                  <span>Rs {total.toFixed(2)}</span>
                </div>
                {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                <button
                  onClick={handleCheckout}
                  disabled={isLoading || cart.length === 0}
                  className={`w-full mt-6 py-3 px-4 rounded transition ${
                    isLoading || cart.length === 0 ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPopup;