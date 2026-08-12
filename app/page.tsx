import { getHeroContent } from "./lib/heroContent";
import { getVisibleProjects } from "./lib/projectContent";
import { getSettings } from "./lib/settingsContent";
import HomeClient from "./HomeClient";

/*
 * Server shell: reads the hero content from disk and hands it to the client
 * tree. Kept as a server component so the JSON is read at request time — the
 * admin panel's revalidatePath("/") then makes a save visible immediately.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  const [hero, projects, settings] = await Promise.all([
    getHeroContent(),
    getVisibleProjects(),
    getSettings(),
  ]);
  return <HomeClient hero={hero} projects={projects} settings={settings} />;
}
