import type { ZoneId } from "@/domain/zones/zone";

export type MapCoordinate = [latitude: number, longitude: number];

export type MandalselvaMapZone = {
  id: ZoneId;
  name: string;
  color: string;
  sourceUrl: string;
  boundary: MapCoordinate[];
};

function coordinates(values: readonly number[]): MapCoordinate[] {
  const result: MapCoordinate[] = [];
  for (let index = 0; index < values.length; index += 2) {
    result.push([values[index], values[index + 1]]);
  }
  return result;
}

const zone1 = coordinates([
  58.019272, 7.458, 58.020818, 7.461605, 58.022909, 7.463493, 58.025091, 7.458, 58.026545, 7.462292,
  58.027, 7.472591, 58.03209, 7.488556, 58.037179, 7.491131, 58.041722, 7.495766, 58.044902,
  7.500744, 58.048536, 7.503319, 58.049172, 7.492847, 58.04045, 7.484951, 58.035634, 7.479115,
  58.032635, 7.466068, 58.028363, 7.452679, 58.025182, 7.448559, 58.021818, 7.450962, 58.018727,
  7.458515, 58.019272, 7.458,
]);

const zone2 = coordinates([
  58.151488, 7.549496, 58.15176, 7.555332, 58.149314, 7.55619, 58.146053, 7.553101, 58.130286,
  7.537651, 58.123759, 7.536106, 58.118864, 7.532673, 58.117232, 7.530956, 58.114421, 7.541084,
  58.111157, 7.541771, 58.107166, 7.536793, 58.102268, 7.537994, 58.087026, 7.522717, 58.08503,
  7.517223, 58.079221, 7.520657, 58.073957, 7.520485, 58.070416, 7.516022, 58.055251, 7.508469,
  58.04862, 7.502804, 58.048893, 7.493019, 58.059702, 7.500401, 58.071142, 7.509155, 58.076589,
  7.511559, 58.080311, 7.51276, 58.087026, 7.508297, 58.090021, 7.513103, 58.091926, 7.519283,
  58.098096, 7.526836, 58.103538, 7.528896, 58.104627, 7.530613, 58.111429, 7.5313, 58.113424,
  7.532845, 58.115872, 7.524605, 58.118229, 7.51997, 58.125663, 7.530613, 58.129017, 7.530098,
  58.136448, 7.534733, 58.139982, 7.539539, 58.14406, 7.542286, 58.151488, 7.549496,
]);

const zone3 = coordinates([
  58.250939, 7.517481, 58.25077, 7.518425, 58.249008, 7.51791, 58.247913, 7.517309, 58.246931,
  7.515936, 58.24553, 7.514884, 58.244412, 7.514069, 58.242086, 7.513189, 58.241205, 7.512653,
  58.238664, 7.512589, 58.23579, 7.511988, 58.23335, 7.513533, 58.230504, 7.511129, 58.22847,
  7.516708, 58.226301, 7.519112, 58.224041, 7.518082, 58.217125, 7.52718, 58.208534, 7.527437,
  58.203877, 7.530441, 58.194921, 7.53396, 58.189854, 7.537394, 58.182434, 7.541428, 58.174333,
  7.550869, 58.176279, 7.556534, 58.174831, 7.562027, 58.171255, 7.564173, 58.168675, 7.564602,
  58.165551, 7.56031, 58.163061, 7.560654, 58.160616, 7.553101, 58.158216, 7.55353, 58.156133,
  7.556276, 58.153054, 7.554474, 58.150472, 7.554302, 58.148846, 7.552865, 58.149265, 7.552221,
  58.15162, 7.551877, 58.159575, 7.547779, 58.169082, 7.555504, 58.172025, 7.548637, 58.174514,
  7.54323, 58.180895, 7.532587, 58.222549, 7.512331, 58.238275, 7.50598, 58.246226, 7.510614,
  58.248259, 7.514648, 58.250939, 7.517481,
]);

const zone4 = coordinates([
  58.428402, 7.533703, 58.432896, 7.533016, 58.434109, 7.545462, 58.437164, 7.548809, 58.435681,
  7.541857, 58.434154, 7.5319, 58.430649, 7.53087, 58.42638, 7.531557, 58.42238, 7.524862,
  58.418559, 7.532244, 58.409343, 7.531643, 58.403273, 7.53027, 58.396887, 7.528811, 58.38717,
  7.526407, 58.3743, 7.528038, 58.365343, 7.528725, 58.362237, 7.529068, 58.356473, 7.529411,
  58.352195, 7.526407, 58.346881, 7.526064, 58.336429, 7.528467, 58.332554, 7.527781, 58.325975,
  7.52924, 58.329355, 7.523575, 58.336069, 7.520056, 58.335483, 7.514563, 58.32904, 7.511215,
  58.324037, 7.513018, 58.317321, 7.514906, 58.312317, 7.517309, 58.307943, 7.52409, 58.299735,
  7.524347, 58.294368, 7.526751, 58.296262, 7.529755, 58.302667, 7.53336, 58.309792, 7.53293,
  58.314526, 7.533875, 58.327237, 7.533274, 58.336114, 7.532415, 58.346881, 7.529497, 58.355753,
  7.533102, 58.365163, 7.531986, 58.376101, 7.529755, 58.380061, 7.534304, 58.380016, 7.530098,
  58.395088, 7.529755, 58.401654, 7.532587, 58.415278, 7.535591, 58.42638, 7.534819, 58.428402,
  7.533703,
]);

export const mandalselvaMapZones: readonly MandalselvaMapZone[] = [
  {
    id: 1,
    name: "Sone 1 · Nedre Mandalselva",
    color: "#b8dceb",
    sourceUrl: "https://lakseelver.no/nb/elver/mandalselva/sone-1",
    boundary: zone1,
  },
  {
    id: 2,
    name: "Sone 2 · Leirkjær–Øyslebø",
    color: "#2c7da0",
    sourceUrl: "https://lakseelver.no/nb/elver/mandalselva/sone-2",
    boundary: zone2,
  },
  {
    id: 3,
    name: "Sone 3 · Øyslebø–Laudal",
    color: "#123b5d",
    sourceUrl: "https://lakseelver.no/nb/elver/mandalselva/sone-3",
    boundary: zone3,
  },
  {
    id: 4,
    name: "Sone 4 · Laudal–Kavfossen",
    color: "#1b5e7a",
    sourceUrl: "https://lakseelver.no/nb/elver/mandalselva/sone-4",
    boundary: zone4,
  },
] as const;

export const mandalselvaMapBounds: [MapCoordinate, MapCoordinate] = [
  [58.008, 7.42],
  [58.445, 7.59],
];

export function findMandalselvaZoneAtPosition(position: MapCoordinate): ZoneId | undefined {
  const [latitude, longitude] = position;

  return mandalselvaMapZones.find((zone) => {
    let isInside = false;
    for (
      let current = 0, previous = zone.boundary.length - 1;
      current < zone.boundary.length;
      previous = current++
    ) {
      const [currentLatitude, currentLongitude] = zone.boundary[current];
      const [previousLatitude, previousLongitude] = zone.boundary[previous];
      const crossesLatitude = currentLatitude > latitude !== previousLatitude > latitude;
      const intersectionLongitude =
        ((previousLongitude - currentLongitude) * (latitude - currentLatitude)) /
          (previousLatitude - currentLatitude) +
        currentLongitude;

      if (crossesLatitude && longitude < intersectionLongitude) isInside = !isInside;
    }
    return isInside;
  })?.id;
}
