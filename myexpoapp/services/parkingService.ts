import Config from "../constants/Config";

export async function fetchNearbyParkingApi(lat: number, lon: number): Promise<any[]> {
  try {
    const response = await fetch(`${Config.BACKEND_URL}/parkings`, { timeout: 5000 } as any);
    if (!response.ok) throw new Error("Backend error");
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p: any) => ({
        id: p._id || p.id,
        lat: p.location?.coordinates?.[1] || p.latitude || p.lat || 23.1930, 
        lon: p.location?.coordinates?.[0] || p.longitude || p.lon || 77.4420,
        name: p.name || "Smart Parking",
        availableSlots: p.available_slots ?? p.availableSlots ?? 0,
        totalSlots: p.total_capacity ?? p.totalSlots ?? 100,
        price: "₹20/hr",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
      }));
    }
  } catch (error) {
    console.log("Using Fallback Data (Backend Down)");
  }

  // PRE-DEFINED PROFESSIONAL FALLBACK DATA (Demo Ready)
  return [
    {
      id: "demo-1",
      lat: 23.1930, 
      lon: 77.4420,
      name: "Aashima Mall Parking",
      availableSlots: 45,
      totalSlots: 150,
      price: "₹30/hr",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "demo-2",
      lat: 23.1780,
      lon: 77.4310,
      name: "C21 Mall Parking",
      availableSlots: 12,
      totalSlots: 80,
      price: "₹20/hr",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400"
    }
  ];
}

export async function fetchUserHistoryApi(): Promise<any[]> {
  return [
    { id: "1", parkingName: "Aashima Mall", plate: "MH04JM8765", date: "Today, 11:30 AM", duration: "2h 15m", cost: "₹65", status: "Completed" },
    { id: "2", parkingName: "C21 Mall", plate: "MH04JM8765", date: "Yesterday, 04:20 PM", duration: "1h 45m", cost: "₹40", status: "Completed" },
  ];
}

export async function fetchRouteApi(start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }): Promise<any[]> {
  return [
    { latitude: start.latitude, longitude: start.longitude },
    { latitude: (start.latitude + end.latitude) / 2 + 0.001, longitude: (start.longitude + end.longitude) / 2 },
    { latitude: end.latitude, longitude: end.longitude }
  ];
}

export async function fetchProfileApi(email: string): Promise<any> {
  try {
    const response = await fetch(`${Config.BACKEND_URL}/profile/${email}`);
    if (response.ok) return await response.json();
  } catch (error) {
    console.log("Profile fetch error:", error);
  }
  return { full_name: "Abhishek Maury", email: email, wallet_balance: 500 };
}

export async function updateProfileApi(data: { email: string, full_name: string }): Promise<boolean> {
  try {
    const response = await fetch(`${Config.BACKEND_URL}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return response.ok;
  } catch (error) {
    console.log("Profile update error:", error);
    return false;
  }
}
