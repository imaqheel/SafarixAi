import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertTrip, Trip } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Helper to ensure dates are strings (if using Date objects in form)
// This matches the schema expectation of text for dates
const formatDate = (date: Date | string) => {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0];
};

export function useTrips() {
  return useQuery({
    queryKey: ['/api/trips'], // Generic key if list endpoint existed
    enabled: false, // No list endpoint defined in requirements
  });
}

export function useTrip(id: number) {
  return useQuery({
    queryKey: [api.trips.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.trips.get.path, { id });
      const res = await fetch(url);

      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch trip details");

      return api.trips.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  return useMutation({
    mutationFn: async (data: InsertTrip) => {
      // Ensure specific fields are formatted correctly if they come from complex form controls
      const payload = {
        ...data,
        // Fallback for types if needed, though zod should handle validation
      };

      const token = localStorage.getItem("safarix_token");
      const res = await fetch(api.trips.create.path, {
        method: api.trips.create.method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create trip itinerary");
      }

      return api.trips.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Trip Generated!",
        description: "Your personalized itinerary is ready.",
      });
      // Invalidate queries if we had a list
      // Navigate to the new trip
      setLocation(`/trip/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
