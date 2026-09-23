import Wall from "@/components/Wall";
import { listWall } from "@/lib/postits";

export const dynamic = "force-dynamic";

export default async function Home() {
  const postits = await listWall();
  return <Wall initial={postits} />;
}
