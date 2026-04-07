import React, { useState } from 'react';

interface PayButtonProps {
  planId: string;
  billing: 'monthly' | 'annual';
  planName: string;
  price: number;
  onPaymentStart?: () => void;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const PayButton: React.FC<PayButtonProps> = ({
  planId,
  billing,
  planName,
  price,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  className = '',
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (disabled || loading) return;

    setLoading(true);
    onPaymentStart?.();

    try {
      const response = await fetch('/api/member/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billing
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao processar pagamento');
      }

      if (data.success && data.data) {
        // Redirect to MercadoPago
        const checkoutUrl = process.env.NODE_ENV === 'production' 
          ? data.data.initPoint 
          : data.data.sandboxInitPoint;
          
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          throw new Error('URL de pagamento não encontrada');
        }
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      onPaymentError?.(error.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`
        group relative overflow-hidden rounded-lg font-semibold transition-all duration-200 transform
        ${disabled || loading 
          ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
        }
        ${className}
      `}
    >
      {/* Background Animation */}
      {!disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Button Content */}
      <div className="relative px-6 py-3 flex items-center justify-center">
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Aguarde...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Confirmar pagamento
              <span className="ml-1 text-xs opacity-80">
              /{billing === 'annual' ? 'ano' : 'mês'}
            </span>
          </>
        )}
      </div>

      {/* Shine Effect */}
      {!disabled && !loading && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
        </div>
      )}
    </button>
  );
};

export default PayButton;
