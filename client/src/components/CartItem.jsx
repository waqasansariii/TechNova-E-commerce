function CartItem({ item, onRemove, onUpdateQuantity }) {
  return (
    <div className="flex items-center py-4 border-b">
      <img
        src={item.product.image}
        alt={item.product.alt}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="ml-4 flex-1">
        <h3 className="text-gray-800 font-medium">{item.product.name}</h3>
        <p className="text-gray-600">Rs {item.product.price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <button
            onClick={() => onUpdateQuantity(item.product._id, item.quantity - 1)}
            className="text-gray-500 hover:text-indigo-600"
            disabled={item.quantity <= 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="mx-2">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.product._id, item.quantity + 1)}
            className="text-gray-500 hover:text-indigo-600"
            disabled={item.quantity >= item.product.stock}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <button
          onClick={() => onRemove(item.product._id)}
          className="text-gray-500 hover:text-red-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        <p className="text-gray-800 font-semibold mt-2">
          Rs{(item.product.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default CartItem;