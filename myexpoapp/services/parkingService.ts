import Config from "../constants/Config";
import { authService } from "./authService";

export async function fetchNearbyParkingApi(lat: number, lon: number): Promise<any[]> {
  try {
    const response = await fetch(`${Config.BACKEND_URL}/parkings`, { timeout: 5000 } as any);
    if (!response.ok) throw new Error("Backend error");
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p: any, index: number) => ({
        id: p._id || p.id,
        // Grid offset for missing coordinates so they don't perfectly stack
        lat: p.location?.coordinates?.[1] || p.latitude || p.lat || (23.1930 + (Math.floor(index / 5) * 0.01) - 0.02), 
        lon: p.location?.coordinates?.[0] || p.longitude || p.lon || (77.4420 + ((index % 5) * 0.01) - 0.02),
        name: p.name || "Smart Parking",
        availableSlots: p.available_slots ?? p.availableSlots ?? 0,
        totalSlots: p.total_capacity ?? p.totalSlots ?? 100,
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
      lat: lat + 0.002, 
      lon: lon + 0.002,
      name: "Aashima Mall Parking",
      availableSlots: 45,
      totalSlots: 150,
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?auto=format&fit=crop&q=80&w=400"
    },
    {
      id: "demo-2",
      lat: lat - 0.002,
      lon: lon - 0.001,
      name: "C21 Mall Parking",
      availableSlots: 12,
      totalSlots: 80,
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=400"
    }
  ];
}

export async function fetchUserHistoryApi(): Promise<any[]> {
  try {
    const user = await authService.getCurrentUser();
    if (!user || !user.email) return [];
    
    const response = await fetch(`${Config.BACKEND_URL}/history/${user.email}`);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error) {
    console.log("History fetch error:", error);
  }
  return [];
}

export async function fetchRouteApi(start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }): Promise<{ coords: any[], distance: number, duration: number }> {
  try {
    const response = await fetch(`http://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`);
    if (response.ok) {
      const data = await response.json();
      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c: any) => ({
          latitude: c[1],
          longitude: c[0]
        }));
        
        return {
          coords,
          distance: route.distance, // in meters
          duration: route.duration  // in seconds
        };
      }
    }
  } catch (err) {
    console.log("OSRM Error", err);
  }

  // Fallback to straight line if OSRM fails
  return {
    coords: [
      { latitude: start.latitude, longitude: start.longitude },
      { latitude: end.latitude, longitude: end.longitude }
    ],
    distance: 0,
    duration: 0
  };
}

export async function fetchProfileApi(email: string): Promise<any> {
  try {
    const response = await fetch(`${Config.BACKEND_URL}/profile/${email}`);
    if (response.ok) return await response.json();
  } catch (error) {
    console.log("Profile fetch error:", error);
  }
  return { full_name: "Abhishek Maury", email: email };
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
