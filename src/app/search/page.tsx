import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

const Page = async ({ searchParams }: PageProps) => {
  const query = searchParams.query;

  if (!query || Array.isArray(query)) {
    return redirect("/");
  }

  const products = await db
    .select()
    .from(productsTable)
    .where(
      sql`to_tsvector('simple',lower(${productsTable.name} || " " || ${productsTable.description})) @@ to_tsquery('simple', ${query.trim().split(" ").join(" & ")})`
    )
    .limit(4);
  // querying logic

  return <pre>{JSON.stringify(products, null, 2)}</pre>;
};

export default Page;
