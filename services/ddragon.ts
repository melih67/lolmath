
// Service to interact with Riot Games' Data Dragon API
// We fetch the latest version and then the static data JSONs.

let currentVersion = "14.1.1"; // Fallback
const BASE_URL = "https://ddragon.leagueoflegends.com";

interface DDragonState {
  champions: Record<string, any>;
  items: Record<string, any>;
  runes: any[];
  summoners: Record<string, any>;
  isLoaded: boolean;
}

const state: DDragonState = {
  champions: {},
  items: {},
  runes: [],
  summoners: {},
  isLoaded: false,
};

export const initDDragon = async () => {
  if (state.isLoaded) return;

  try {
    // 1. Get latest version
    const versionRes = await fetch(`${BASE_URL}/api/versions.json`);
    const versions = await versionRes.json();
    currentVersion = versions[0];
    console.log(`LoL Data Version: ${currentVersion}`);

    // 2. Fetch Data in parallel
    const [champsRes, itemsRes, runesRes, summonerRes] = await Promise.all([
      fetch(`${BASE_URL}/cdn/${currentVersion}/data/en_US/champion.json`),
      fetch(`${BASE_URL}/cdn/${currentVersion}/data/en_US/item.json`),
      fetch(`${BASE_URL}/cdn/${currentVersion}/data/en_US/runesReforged.json`),
      fetch(`${BASE_URL}/cdn/${currentVersion}/data/en_US/summoner.json`)
    ]);

    const champsData = await champsRes.json();
    const itemsData = await itemsRes.json();
    const runesData = await runesRes.json();
    const summonerData = await summonerRes.json();

    state.champions = champsData.data;
    state.items = itemsData.data;
    state.runes = runesData;
    state.summoners = summonerData.data;
    state.isLoaded = true;

  } catch (e) {
    console.error("Failed to load DDragon data", e);
    // Keep fallback state if failed, or throw
  }
};

export const getAllChampionNames = (): string[] => {
  return Object.values(state.champions).map((c: any) => c.name).sort();
};

export const getChampionIdByName = (name: string): string | null => {
  const champ = Object.values(state.champions).find((c: any) => c.name.toLowerCase() === name.toLowerCase());
  return champ ? champ.id : null;
};

// Returns the full image URL for a champion's square asset
export const getChampionIconUrl = (name: string): string => {
  const id = getChampionIdByName(name);
  if (!id) return `https://ui-avatars.com/api/?name=${name}&background=0D8ABC&color=fff`;
  return `${BASE_URL}/cdn/${currentVersion}/img/champion/${id}.png`;
};

// Returns the splash art (loading screen slice)
export const getChampionLoadingUrl = (name: string): string => {
  const id = getChampionIdByName(name);
  if (!id) return "";
  return `${BASE_URL}/cdn/img/champion/loading/${id}_0.jpg`;
};

// Returns the spell icon URL for a specific key (Q, W, E, R)
// We need to fetch individual champion data for this usually, but champion.json has a summary
// Actually, champion.json only has main info. For spells, the structure in full champion.json is needed,
// OR we can just rely on the passive/spell filenames if we had the full individual json.
// Optimization: We will use the main champion.json's "spells" array if available, but standard champion.json (the list) usually doesn't have detailed spell info per champ, wait.
// Correction: The 'champion.json' file fetched from CDN is a summary. It does NOT contain spell image filenames usually.
// We must fetch individual champion data OR use a best-guess if we want perfect spell icons. 
// However, fetching 160+ JSONs is bad.
// Let's check if there is a 'championFull.json'. Yes there is. It's larger (around 10MB+).
// Strategy: For this app, to avoid 10MB download, we might skip specific spell icons or fetch specific champ data on demand.
// Let's try to fetch specific champ data on demand in `getDetailedChampionData`.

export const getSpecificChampionData = async (championName: string) => {
  const id = getChampionIdByName(championName);
  if (!id) return null;
  try {
     const res = await fetch(`${BASE_URL}/cdn/${currentVersion}/data/en_US/champion/${id}.json`);
     const data = await res.json();
     return data.data[id];
  } catch (e) {
    console.error(`Failed to fetch detail for ${championName}`, e);
    return null;
  }
}

export const getSpellIconUrl = (imageFileName: string): string => {
    return `${BASE_URL}/cdn/${currentVersion}/img/spell/${imageFileName}`;
}

export const getPassiveIconUrl = (imageFileName: string): string => {
    return `${BASE_URL}/cdn/${currentVersion}/img/passive/${imageFileName}`;
}

// Helper to find item ID by fuzzy name
export const getItemIconUrl = (itemName: string): string => {
  // exact match
  let item = Object.values(state.items).find((i: any) => i.name.toLowerCase() === itemName.toLowerCase());
  
  // if not found, try includes
  if (!item) {
     item = Object.values(state.items).find((i: any) => i.name.toLowerCase().includes(itemName.toLowerCase()));
  }

  // Handle common abbreviations or Gemini hallucinations
  if (!item) {
    const manualMap: Record<string, string> = {
      "bork": "Blade of the Ruined King",
      "botrk": "Blade of the Ruined King",
      "ie": "Infinity Edge",
      "ga": "Guardian Angel",
      "dd": "Death's Dance"
    };
    const mappedName = manualMap[itemName.toLowerCase()];
    if (mappedName) {
        item = Object.values(state.items).find((i: any) => i.name.toLowerCase() === mappedName.toLowerCase());
    }
  }

  if (item) {
    return `${BASE_URL}/cdn/${currentVersion}/img/item/${item.image.full}`;
  }
  
  // Return a generic placeholder or null if not found
  return ""; 
};

// Helper for Runes
export const getRuneIconUrl = (runeName: string): string => {
  // Runes are nested.
  // structure: [{ id, key, icon, slots: [ { runes: [ { id, key, icon, name } ] } ] }]
  
  for (const tree of state.runes) {
      if (tree.name === runeName || tree.key === runeName) {
          return `${BASE_URL}/cdn/img/${tree.icon}`;
      }
      for (const slot of tree.slots) {
          for (const rune of slot.runes) {
              if (rune.name.toLowerCase() === runeName.toLowerCase()) {
                  return `${BASE_URL}/cdn/img/${rune.icon}`;
              }
          }
      }
  }
  
  // Try stat shards (which are not always in runesReforged.json clearly labeled by name in old versions, but usually are now or we map manually)
  // Simple manual map for common shards if missing
  if (runeName.includes("Adaptive")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsAdaptiveForceIcon.png";
  if (runeName.includes("Armor")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsArmorIcon.png";
  if (runeName.includes("Health")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsHealthScalingIcon.png";
  if (runeName.includes("Haste")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsCDRScalingIcon.png";
  if (runeName.includes("Attack Speed")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsAttackSpeedIcon.png";
  if (runeName.includes("Magic Resist")) return "https://ddragon.leagueoflegends.com/cdn/img/perk-images/StatMods/StatModsMagicResIcon.png";

  return "";
};
