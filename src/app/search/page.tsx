import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

/**
 * Renders a page that performs a search on the products database.
 * @param {{searchParams: Promise<{[key: string]: string | string[] | undefined}>}} props - The Next.js page props.
 * @returns {Promise<JSX.Element>} - The rendered page.
 */

const Page = async ({ searchParams }: PageProps) => {
  const query = (await searchParams)?.query;

  if (!query || Array.isArray(query)) {
    return redirect("/");
  }

  /**
   * Hace una busqueda en la base de datos de productos.
   * @param {string} query - La busqueda a realizar.
   * @returns {Promise<import("@drizzle-orm/core").QueryResult>} - Los productos que coinciden con la busqueda.
   */

  const products = await db
    .select()
    .from(productsTable)
    .where(
      sql`to_tsvector('simple', lower(concat(${productsTable.name}, ' ', ${productsTable.description}))) @@ to_tsquery('simple', ${query.trim().toLowerCase().split(/\s+/).join(" & ")})`
    )
    .limit(4);

  return <pre>{JSON.stringify(products, null, 2)}</pre>;
};

export default Page;
