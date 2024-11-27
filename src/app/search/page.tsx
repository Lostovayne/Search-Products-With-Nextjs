import { db } from "@/db";
import { productsTable, type Product } from "@/db/schema";
import { vectorize } from "@/lib/vectorize";
import { Index } from "@upstash/vector";
import { sql } from "drizzle-orm";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { redirect } from "next/navigation";

interface PageProps {
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export type CoreProduct = Omit<Product, "createdAt" | "updatedAt">;

const index = new Index<CoreProduct>();

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

  const products: CoreProduct[] = await db
    .select()
    .from(productsTable)
    .where(
      sql`to_tsvector('simple', lower(concat(${productsTable.name}, ' ', ${productsTable.description}))) @@ to_tsquery('simple', ${query.trim().toLowerCase().split(/\s+/).join(" & ")})`
    )
    .limit(4);

  if (products.length < 3) {
    // search products by semantic similarity
    const vector = await vectorize(query);

    const res = await index.query({
      topK: 5,
      vector,
      includeMetadata: true,
    });

    const vectorProducts = res
      .filter((existingProduct) => {
        if (products.some((product) => product.id === existingProduct.id) || existingProduct.score < 0.9) {
          return false;
        } else {
          return true;
        }
      })
      .map(({ metadata }) => metadata!);

    products.push(...vectorProducts);
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-4 bg-white shadow-md rounded-b-md">
        <X className="mx-auto size-8 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900 ">No products found</h3>
        <p className="mt-1 text-sm text-gray-500 mx-auto max-w-prose">
          Sorry, we couldn&apos;t find any products that match your search.{" "}
          <span className="text-green-600 font-medium">{query}</span>
        </p>
      </div>
    );
  }

  return (
    <ul className="py-4 divide-y divide-zinc-100 bg-white shadow-md rounded-b-md">
      {products.slice(0, 3).map((product) => (
        <Link key={product.id} href={`/products/${product.id}`}>
          <li className="mx-auto py-4 px-8 flex space-x-4">
            <div className="relative flex items-center bg-zinc-100 rounded-lg h-40 w-40">
              <Image loading="eager" fill alt="product-image" src={`/${product.imageId}`} />
            </div>
            <div className="w-full flex-1 space-y-2 py-1">
              <h1 className="text-lg font-medium text-gray-900">{product.name}</h1>
              <p className="prose prose-sm text-gray-500 line-clamp-3">{product.description}</p>
              <p className="text-base font-medium text-gray-900">${product.price.toFixed(2)}</p>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
};

export default Page;
