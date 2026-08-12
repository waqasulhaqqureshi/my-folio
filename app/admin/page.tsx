import { redirect } from "next/navigation";
import { isAuthed } from "../lib/adminAuth";
import { getHeroContent } from "../lib/heroContent";
import { getProjects } from "../lib/projectContent";
import AdminGate from "./AdminGate";
import AdminShell from "./AdminShell";

/*
 * /admin — server component.
 *
 * The password check happens HERE, on the server, before any content is sent.
 * A client-side "if (!authed) show gate" would still ship the editor and the
 * current content to an unauthenticated visitor, who could read it straight
 * out of the page source.
 */
export const dynamic = "force-dynamic"; // never cache an auth-dependent page

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const authed = await isAuthed();
  if (!authed) return <AdminGate />;

  const { next } = await searchParams;
  if (next && !next.startsWith("/")) redirect("/admin"); // open-redirect guard

  const [hero, projects] = await Promise.all([getHeroContent(), getProjects()]);
  return <AdminShell hero={hero} projects={projects} />;
}
