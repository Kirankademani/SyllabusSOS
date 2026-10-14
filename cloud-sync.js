
const SYLLABUSSOS_CLOUD_KEYS = [
  "syllabussos_subjects",
  "syllabussos_topics",
  "syllabussos_revisions",
  "syllabussos_weekly_goal",
  "syllabussos_weekly_activity",
  "syllabussos_study_streak"
];

async function saveSyllabusSOSDataToCloud() {
  const { data: { user }, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in before syncing your study data.");
  }

  const records = SYLLABUSSOS_CLOUD_KEYS
    .map((dataKey) => {
      const rawValue = localStorage.getItem(dataKey);

      if (rawValue === null) return null;

      let parsedValue;

      try {
        parsedValue = JSON.parse(rawValue);
      } catch {
        parsedValue = rawValue;
      }

      return {
        user_id: user.id,
        data_key: dataKey,
        data: { value: parsedValue },
        updated_at: new Date().toISOString()
      };
    })
    .filter(Boolean);

  if (records.length === 0) {
    return { saved: 0 };
  }

  const { error } = await supabaseClient
    .from("syllabussos_data")
    .upsert(records, { onConflict: "user_id,data_key" });

  if (error) throw error;

  return { saved: records.length };
}

async function loadSyllabusSOSDataFromCloud() {
  const { data: { user }, error: userError } =
    await supabaseClient.auth.getUser();

  if (userError || !user) {
    throw new Error("Please sign in before loading your study data.");
  }

  const { data, error } = await supabaseClient
    .from("syllabussos_data")
    .select("data_key, data")
    .eq("user_id", user.id);

  if (error) throw error;

  for (const record of data) {
    if (!SYLLABUSSOS_CLOUD_KEYS.includes(record.data_key)) continue;

    if (record.data && Object.hasOwn(record.data, "value")) {
      const value = record.data.value;
      localStorage.setItem(
        record.data_key,
        typeof value === "string" ? value : JSON.stringify(value)
      );
    }
  }

  return { loaded: data.length };
}
