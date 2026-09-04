import { GoogleGenerativeAI } from '@google/generative-ai';
import { store } from './store';

const SYSTEM_INSTRUCTION = `You are the RiceShare Food Assistant.
RiceShare connects restaurants, event organizers, bakeries and other food providers with people and community organizations across Sri Lanka.
Providers can list surplus food for discounted sale or free donation.
Customers can search, reserve and request food.

Key Rules:
1. Answer questions specifically about RiceShare.
2. Keep responses short, friendly, and practical (1-3 concise paragraphs).
3. Do not invent RiceShare features. (RiceShare uses "Reserve & Pay at Pickup", no online payment gateway is required).
4. If the question is unrelated to RiceShare or surplus food in Sri Lanka, politely explain that you can only help with RiceShare questions.
5. If the user asks about available food in a specific location (e.g. Malabe, Colombo, Kaduwela, Galle), reference the current live listings provided in context below.`;

function getLiveListingsContext(): string {
  const active = store.getListings({ status: 'AVAILABLE' });
  if (active.length === 0) {
    return 'Currently there are no active surplus food listings.';
  }
  return active.map(l => 
    `- ${l.foodName} by ${l.providerName} in ${l.location} (${l.listingType === 'SALE' ? `Rs. ${l.sellingPrice} - was Rs. ${l.originalPrice}` : 'FREE DONATION'}, ${l.quantityRemaining} portions available, pickup until ${new Date(l.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
  ).join('\n');
}

export async function askRiceShareAssistant(userMessage: string, chatHistory: Array<{ role: 'user' | 'model'; parts: string }> = []): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // Try gemini-1.5-flash
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nCURRENT LIVE FOOD LISTINGS ON RICESHARE:\n${getLiveListingsContext()}`,
      });

      const response = await model.generateContent({
        contents: [
          ...chatHistory.map(h => ({
            role: h.role,
            parts: [{ text: h.parts }],
          })),
          {
            role: 'user',
            parts: [{ text: userMessage }],
          }
        ],
      });

      const text = response.response.text();
      if (text) return text.trim();
    } catch (err: any) {
      console.warn('Gemini API call failed, using graceful fallback knowledge engine:', err.message);
    }
  }

  // Graceful rule-based fallback when Gemini API key is not configured or offline
  return getIntelligentFallback(userMessage);
}

function getIntelligentFallback(message: string): string {
  const q = message.toLowerCase();
  const activeListings = store.getListings({ status: 'AVAILABLE' });

  // Location queries: e.g. "food in malabe", "donations in kaduwela"
  const locations = ['malabe', 'kaduwela', 'colombo', 'galle', 'battaramulla'];
  for (const loc of locations) {
    if (q.includes(loc)) {
      const matches = activeListings.filter(l => l.location.toLowerCase().includes(loc));
      if (matches.length > 0) {
        const listDesc = matches.map(m => `• ${m.foodName} at ${m.providerName} (${m.listingType === 'SALE' ? `Rs. ${m.sellingPrice}` : 'FREE DONATION'} - ${m.quantityRemaining} portions)`).join('\n');
        return `Yes! We currently have available surplus food in **${loc.charAt(0).toUpperCase() + loc.slice(1)}**:\n\n${listDesc}\n\nYou can head over to our **Browse Food** page to reserve or request a pickup!`;
      } else {
        return `Currently, there are no active listings in **${loc.charAt(0).toUpperCase() + loc.slice(1)}**. Please check back shortly or explore nearby areas like Colombo or Malabe!`;
      }
    }
  }

  if (q.includes('donate') || q.includes('donation')) {
    return `**How Donations Work on RiceShare:**\n\n• **For Customers & Charities:** You can browse listings marked with the **DONATION** badge (they are 100% FREE). Submit a donation request with your organization details and reason. Once accepted by the provider, your portions are reserved for pickup.\n• **For Providers:** When adding surplus food, select **DONATION**. The price is automatically set to Rs. 0. You can review and accept incoming donation requests from your Provider Dashboard.`;
  }

  if (q.includes('reserve') || q.includes('buy') || q.includes('purchase') || q.includes('pay')) {
    return `**How to Reserve Food on RiceShare:**\n\n1. Go to the **Browse Food** page.\n2. Choose any food item marked as **SALE**.\n3. Click **View Details** and then **Reserve Food**.\n4. Enter your name, phone number, and requested portions.\n5. Select **Reserve & Pay at Pickup** — no online credit card is required! Your food will be waiting at the designated pickup window.`;
  }

  if (q.includes('list') || q.includes('sell') || q.includes('provider') || q.includes('partner')) {
    return `**How Providers List Food:**\n\n1. Sign in and navigate to the **Provider Dashboard**.\n2. Click **Add Food** in the navigation.\n3. Fill in the food name, category, quantity, original price, and selling price (or select DONATION for free distribution).\n4. Specify the pickup start and end window.\n5. Click **Publish Listing**! Customers in your area will be able to discover and reserve it immediately.`;
  }

  if (q.includes('sell vs donate') || q.includes('should i sell') || q.includes('advice')) {
    return `**Advice: Sell vs Donate Surplus:**\n\n• **Sell at a Discount:** Ideal for prepared meals, bakery items, or packaged snacks where you want to recover food preparation costs while offering affordable meals to community members.\n• **Donate for Free:** Perfect for banquet/event overruns, corporate catering surplus, or when supporting local charitable causes and elderly care homes. Donating creates maximum community goodwill and tax-deductible social impact!`;
  }

  if (q.includes('how does it work') || q.includes('what is riceshare') || q.includes('about')) {
    return `**Welcome to RiceShare! 🍚**\n\nRiceShare is Sri Lanka's surplus-food marketplace with the motto *"Sell it. Share it. Save it."*\n\n1. **List:** Food providers (restaurants, hotels, bakeries) list safe surplus food.\n2. **Discover:** Customers search by location, category, and price.\n3. **Reserve/Request:** Reserve discounted food to pay at pickup, or request free community donations.\n4. **Rescue:** Collect delicious meals and eliminate food waste!`;
  }

  return `I am the **RiceShare Food Assistant**! I can help you with reserving discounted meals, requesting free donations, listing surplus food as a restaurant or bakery, or checking available food in your area (like Malabe or Colombo). What would you like to know?`;
}
