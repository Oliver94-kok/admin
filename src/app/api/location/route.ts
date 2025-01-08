import { db } from "@/lib/db";

const RADIUS = 0.1; // 100 meters in kilometers
const RADIUS_SQUARED = RADIUS * RADIUS;

function isWithinRadiusFast(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): boolean {
  // Convert to radians
  const lat1Rad = (lat1 * Math.PI) / 180;

  // Calculate x and y distances
  const x = (lon2 - lon1) * Math.cos(lat1Rad);
  const y = lat2 - lat1;

  // Scale by 111.32 km (length of one degree at equator)
  // Using distance squared to avoid expensive square root
  const distanceSquared = (x * x + y * y) * (111.32 * 111.32);

  return distanceSquared <= RADIUS_SQUARED;
}
function getDistanceFromLatLonInMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export const POST = async (req: Request) => {
  try {
    const { userId, latitude, longitude } = await req.json();
    if (!latitude || !longitude || !userId) throw new Error("Parameter error");
    const team = await db.attendBranch.findFirst({
      where: { userId },
      select: { team: true },
    });
    const branchs = await db.branch.findMany({ where: { team: team?.team } });
    // const isNearby = branchs.some((coord) =>
    //   isWithinRadiusFast(latitude, longitude, coord.latitude, coord.longtitude),
    // );
    let nearestBranch = null;
    let shortestDistance = 100; // meters

    for (const branch of branchs) {
      const distance = getDistanceFromLatLonInMeters(
        latitude,
        longitude,
        branch.latitude,
        branch.longtitude,
      );

      if (distance <= 100 && distance < shortestDistance) {
        shortestDistance = distance;
        nearestBranch = {
          ...branch,
          distance: Math.round(distance),
        };
      }
    }

    return Response.json({ found: !!nearestBranch, branch: nearestBranch });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        status: "failed",
      },
      { status: 400 },
    );
  }
};
