import Wall from "@/components/Wall";
import { listWall } from "@/lib/postits";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [postits, wallMessages] = await Promise.all([listWall(), getStore().listWallMessages()]);
  return <Wall initial={postits} wallMessages={wallMessages} />;
}
