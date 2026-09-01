/**
 * Starts a server-priced Fastrr / Shiprocket Checkout session.
 * The browser sends only product identifiers and quantities; price, stock and
 * the provider's external variant IDs are reconstructed by the backend.
 */
import api from './api';

export async function beginShiprocketCheckout(cart) {
  if (!Array.isArray(cart) || !cart.length) throw new Error('Your cart is empty');
  const response = await api.raw.post('/checkout/shiprocket-session', {
    items: cart.map((line) => ({
      productId: line.id || line._id,
      slug: line.slug,
      sku: line.sku,
      quantity: line.quantity,
    })),
  });
  const data = response?.data?.data ?? response?.data ?? response;
  const checkoutUrl = data?.checkoutUrl || data?.checkout_url || data?.widgetUrl;
  if (!checkoutUrl) throw new Error('Shiprocket did not return a checkout link. Please try again.');
  return { ...data, checkoutUrl };
}
