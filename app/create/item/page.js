import { Suspense } from "react";
import { CreateItemForm } from "./create-item-form";

export default function CreateItemPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">Loading...</p>}>
      <CreateItemForm />
    </Suspense>
  );
}
