import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { searchPlaces } from "../../services/geocodingService";
import { useNavigationStore } from "../../stores/navigationStore";
import { useMapStore } from "../../stores/mapStore";
import { colors } from "../../constants/theme";
import { Icon } from "../ui/Icon";
import type { SearchResult } from "../../types/navigation";

/** Collapsed "Where to?" pill that expands into a text search over Nominatim. */
const SEARCH_DEBOUNCE_MS = 500;

export function DestinationSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "empty" | "failed">("idle");
  const requestId = useRef(0);

  // Debounced: Nominatim's free demo server rate-limits fast successive
  // requests, so searching on every keystroke silently lost results. Only
  // the text after the user pauses actually goes out over the network.
  useEffect(() => {
    const text = query.trim();
    if (text.length < 3) {
      setResults([]);
      setLoading(false);
      setStatus("idle");
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    setStatus("idle");
    const timer = setTimeout(() => {
      searchPlaces(text)
        .then((found) => {
          if (id !== requestId.current) return;
          setResults(found);
          setStatus(found.length === 0 ? "empty" : "idle");
        })
        .catch(() => {
          if (id !== requestId.current) return;
          setResults([]);
          setStatus("failed");
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("idle");
  }, []);

  const pick = useCallback(
    (result: SearchResult) => {
      useNavigationStore.getState().setDestination({
        coordinate: result.coordinate,
        label: result.label.split(",")[0] ?? result.label,
      });
      useMapStore.getState().setMode("explore");
      close();
    },
    [close],
  );

  if (!open) {
    return (
      <Pressable
        style={styles.collapsed}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Search for a destination"
      >
        <Icon name="search" size={15} color={colors.muted} />
        <Text style={styles.collapsedText}>Where to?</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.panel}>
      <View style={styles.inputRow}>
        <Icon name="search" size={15} color={colors.muted} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a destination"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        {loading ? (
          <ActivityIndicator size="small" color={colors.muted} />
        ) : (
          <Pressable
            onPress={close}
            accessibilityRole="button"
            accessibilityLabel="Close search"
          >
            <Icon name="close" size={15} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {results.length > 0 && (
        <FlatList
          style={styles.results}
          data={results}
          keyExtractor={(item, index) => `${item.coordinate.join(",")}-${index}`}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable style={styles.result} onPress={() => pick(item)}>
              <Text numberOfLines={1} style={styles.resultText}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      )}
      {!loading && status !== "idle" && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            {status === "empty"
              ? "No results — try a more specific search."
              : "Search failed. Check your connection and try again."}
          </Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  collapsed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  collapsedText: { color: colors.muted, fontSize: 13 },
  panel: {
    borderRadius: 20,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 14, color: colors.ink, padding: 0 },
  results: { maxHeight: 200, borderTopWidth: 1, borderTopColor: colors.border },
  result: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultText: { fontSize: 13, color: colors.ink },
});
