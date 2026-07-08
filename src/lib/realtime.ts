import { supabase } from "./supabase";

export const notifyLobby = () => {
  const ch = supabase.channel("lobby");
  ch.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      void ch.send({ type: "broadcast", event: "refresh", payload: {} });
      setTimeout(() => void supabase.removeChannel(ch), 400);
    }
  });
};
