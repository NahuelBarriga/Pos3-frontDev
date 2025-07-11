import { useEffect, useState } from 'react';
import { Coffee, Gift } from 'lucide-react';

const CoffeePromotionCard = () => {
  // State for animation and card flipping
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // This function would be replaced with your actual implementation
  // that gets the coffee count from your database/state
  const getCoffeeCount = () => {
    // Replace this with your actual implementation
    return 5; // Example: user has purchased all 5 coffees
  };
  
  const totalNeeded = 5;
  const coffeesPurchased = getCoffeeCount();
  const isRedeemable = coffeesPurchased >= totalNeeded;
  
  // Random discount code generator - replace with your actual code logic
  const discountCode = "CAFE-" + Math.random().toString(36).substring(2, 7).toUpperCase();
  
  // Handle card click
  const handleCardClick = () => {
    if (!isRedeemable || isFlipped) return;
    
    // Play flip animation
    setIsAnimating(true);
    setTimeout(() => setIsFlipped(true), 300);
    
    // Show confetti effect
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };
  
  // Initial load animation
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative perspective-1000 w-full" style={{ perspective: '1000px' }}>
      {/* Confetti effect (shows when card is flipped) */}
      {showConfetti && (
        <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-5%',
                backgroundColor: ['#FFD700', '#FF6347', '#7FFFD4', '#DDA0DD'][Math.floor(Math.random() * 4)],
                width: `${5 + Math.random() * 10}px`,
                height: `${5 + Math.random() * 10}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
                animationDuration: `${1 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Front side - Promotion Card */}
      <div 
        onClick={handleCardClick}
        className={`
          w-full transform-style-3d transition-all duration-500 relative
          ${isFlipped ? 'rotate-y-180 invisible' : 'rotate-y-0 visible'}
          ${isRedeemable ? 'cursor-pointer hover:scale-102' : ''}
          ${isAnimating && !isFlipped ? 'scale-102' : ''}
        `}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 mt-8 rounded-xl shadow-md overflow-hidden">
          {/* Card content */}
          <div className="relative z-10">
            {/* Header ribbon */}
            <div className="bg-amber-600 text-white font-bold py-3 px-4 uppercase tracking-wide text-center shadow-sm">
              ¡Promoción!
            </div>
            
            {/* Promo description */}
            <div className="px-4 pt-4">
        
              <p className="text-center text-amber-700 mt-1">
                Compra 5 cafés y llévate uno <span className="font-bold">¡GRATIS!</span>
              </p>
            </div>
            
            {/* Progress visualization */}
            <div className="w-full flex justify-center pt-4 px-4 pb-1">
              <div className="flex items-center justify-between w-full max-w-xs bg-white rounded-full px-3 py-2 shadow-inner">
                {[...Array(totalNeeded)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`transition-all duration-300 ${
                      index < coffeesPurchased ? 'scale-110' : 'opacity-60 scale-90'
                    }`}
                  >
                    <Coffee 
                      size={28} 
                      className={
                        index < coffeesPurchased 
                          ? "text-amber-700 drop-shadow-sm" 
                          : "text-amber-300"
                      }
                      strokeWidth={index < coffeesPurchased ? 2 : 1.5}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progress counter */}
            <div className="text-center pb-3 text-amber-800 font-medium">
              {coffeesPurchased} / {totalNeeded} cafés
              {isRedeemable && (
                <div className="mt-2 text-green-600 font-bold animate-pulse flex items-center justify-center gap-1">
                  <Gift size={18} />
                  <span>¡Toca para canjear!</span>
                </div>
              )}
            </div>
            
          
          </div>
        </div>
      </div>

      {/* Back side - Discount Code Reveal */}
      <div 
        className={`
          w-full transform-style-3d transition-all duration-500 absolute top-0 
          ${isFlipped ? 'rotate-y-0 visible' : 'rotate-y-180 invisible'}
        `}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 mt-8 rounded-xl shadow-lg overflow-hidden text-white">
          <div className="p-4 flex flex-col items-center justify-center min-h-52">
            <div className="animate-fadeIn">
              <div className="text-center mb-3">
                {/* <Confetti className="inline-block mb-2" size={40} /> */}
                <h2 className="text-2xl font-bold">¡Felicidades!</h2>
              </div>
              
              <div className="bg-white text-amber-800 rounded-lg p-6 text-center my-4 relative shadow-md">
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-amber-200"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-200"></div>
                <p className="text-xs uppercase tracking-wide mb-1">Tu código de canje</p>
                <div className="font-mono text-2xl font-bold tracking-wider">{discountCode}</div>
              </div>
              
              <button 
                onClick={() => setIsFlipped(false)}
                className="mt-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-white transition-colors duration-200 flex items-center justify-center mx-auto"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Optional floating icon to indicate it's tappable when ready */}
      {/* {isRedeemable && !isFlipped && (
        <div className="absolute -top-3 -right-3 z-20">
          <div className="animate-bounce bg-green-500 text-white p-2 rounded-full shadow-lg">
            <Gift size={24} />
          </div>
        </div>
      )} */}
    </div>
  );
};

// Add these custom animations to your CSS
const styleTag = document.createElement('style');
styleTag.textContent = `
  @keyframes confetti {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(100vh) rotate(360deg); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-confetti {
    position: absolute;
    animation: confetti 3s ease-in-out forwards;
  }
  
  .animate-fadeIn {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .perspective-1000 {
    perspective: 1000px;
  }
  
  .transform-style-3d {
    transform-style: preserve-3d;
  }
  
  .rotate-y-180 {
    transform: rotateY(180deg);
  }
  
  .rotate-y-0 {
    transform: rotateY(0deg);
  }
  
  .scale-102 {
    transform: scale(1.02);
  }
`;
document.head.appendChild(styleTag);

export default CoffeePromotionCard;