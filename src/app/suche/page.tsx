import { Suspense } from "react";
import { SearchResults } from "./results";

export const dynamic = "force-dynamic";

export default function SuchePage() {
  return (
    <Suspense fallback={null}>
      <SearchResults />
    </Suspense>
  );
}
